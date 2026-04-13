import { supabase } from "./supabase";

// ═══════════════════ APP CREDENTIALS ═══════════════════

export async function fetchCredentials() {
  const { data, error } = await supabase
    .from("app_credentials")
    .select("username, password")
    .eq("id", 1)
    .single();
  if (error) {
    if (error.code === "PGRST116") {
      const defaults = { username: "khaled raafat", password: "258001" };
      await supabase.from("app_credentials").insert({ id: 1, ...defaults });
      return defaults;
    }
    throw error;
  }
  return data;
}

export async function updateCredentials({ username, password }) {
  const { error } = await supabase
    .from("app_credentials")
    .update({ username, password, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw error;
}

// ═══════════════════ STUDENTS ═══════════════════

export async function fetchStudents() {
  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;

  // Fetch related data for all students in parallel
  const ids = students.map((s) => s.id);
  const [attendance, invoices, fighter, technical, physical] = await Promise.all([
    supabase.from("attendance").select("*").in("student_id", ids),
    supabase.from("invoices").select("*").in("student_id", ids).order("date", { ascending: false }),
    supabase.from("fighter_ratings").select("*").in("student_id", ids),
    supabase.from("technical_evals").select("*").in("student_id", ids),
    supabase.from("physical_evals").select("*").in("student_id", ids),
  ]);

  // Merge all data into student objects
  return students.map((s) => ({
    id: s.id,
    name: s.name,
    dob: s.dob || "",
    belt: s.belt,
    stripes: s.stripes,
    membershipStart: s.membership_start || "",
    membershipEnd: s.membership_end || "",
    phone: s.phone || "",
    notes: s.notes || "",
    attendance: (attendance.data || [])
      .filter((a) => a.student_id === s.id)
      .map((a) => a.date),
    invoices: (invoices.data || [])
      .filter((i) => i.student_id === s.id)
      .map((i) => ({ id: i.id, date: i.date, amount: Number(i.amount), description: i.description, type: i.type })),
    fighterRatings: (() => {
      const fr = (fighter.data || []).find((f) => f.student_id === s.id);
      if (!fr) return {};
      return { focus: fr.focus, attendance_rating: fr.attendance_rating, performance: fr.performance, behavior: fr.behavior, studying: fr.studying };
    })(),
    technical: (() => {
      const te = (technical.data || []).find((t) => t.student_id === s.id);
      if (!te) return {};
      const { id, student_id, updated_at, ...rest } = te;
      return Object.fromEntries(Object.entries(rest).filter(([, v]) => v));
    })(),
    physical: (() => {
      const pe = (physical.data || []).find((p) => p.student_id === s.id);
      if (!pe) return {};
      const { id, student_id, updated_at, ...rest } = pe;
      return Object.fromEntries(Object.entries(rest).filter(([, v]) => v));
    })(),
  }));
}

export async function createStudent({ name, dob, belt, stripes, membershipStart, membershipEnd, amountPaid, phone, notes }) {
  const { data, error } = await supabase
    .from("students")
    .insert({
      name,
      dob: dob || null,
      belt,
      stripes,
      membership_start: membershipStart || null,
      membership_end: membershipEnd || null,
      phone: phone || null,
      notes: notes || null,
    })
    .select()
    .single();
  if (error) throw error;

  // Create invoice if amount > 0
  if (amountPaid > 0) {
    await supabase.from("invoices").insert({
      student_id: data.id,
      date: new Date().toISOString().split("T")[0],
      amount: amountPaid,
      description: `Membership: ${membershipStart} → ${membershipEnd}`,
      type: "membership",
    });
  }

  return data.id;
}

export async function updateStudent(id, { name, dob, belt, stripes, membershipStart, membershipEnd, phone, notes }) {
  const { error } = await supabase
    .from("students")
    .update({
      name,
      dob: dob || null,
      belt,
      stripes,
      membership_start: membershipStart || null,
      membership_end: membershipEnd || null,
      phone: phone || null,
      notes: notes || null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteStudent(id) {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
}

export async function renewStudent(id, { membershipStart, membershipEnd, amount, description }) {
  // Update membership dates
  await supabase
    .from("students")
    .update({ membership_start: membershipStart, membership_end: membershipEnd })
    .eq("id", id);

  // Create renewal invoice
  const { error } = await supabase.from("invoices").insert({
    student_id: id,
    date: new Date().toISOString().split("T")[0],
    amount,
    description,
    type: "renewal",
  });
  if (error) throw error;
}

// ═══════════════════ ATTENDANCE ═══════════════════

export async function toggleAttendance(studentId, date) {
  // Check if exists
  const { data: existing } = await supabase
    .from("attendance")
    .select("id")
    .eq("student_id", studentId)
    .eq("date", date)
    .single();

  if (existing) {
    await supabase.from("attendance").delete().eq("id", existing.id);
    return false; // removed
  } else {
    await supabase.from("attendance").insert({ student_id: studentId, date });
    return true; // added
  }
}

// ═══════════════════ FIGHTER RATINGS ═══════════════════

export async function updateFighterRating(studentId, key, value) {
  // Upsert: insert or update
  const { data: existing } = await supabase
    .from("fighter_ratings")
    .select("id")
    .eq("student_id", studentId)
    .single();

  if (existing) {
    await supabase.from("fighter_ratings").update({ [key]: value }).eq("student_id", studentId);
  } else {
    await supabase.from("fighter_ratings").insert({ student_id: studentId, [key]: value });
  }
}

// ═══════════════════ TECHNICAL EVALS ═══════════════════

export async function updateTechnicalEval(studentId, key, value) {
  const { data: existing } = await supabase
    .from("technical_evals")
    .select("id")
    .eq("student_id", studentId)
    .single();

  if (existing) {
    await supabase.from("technical_evals").update({ [key]: value }).eq("student_id", studentId);
  } else {
    await supabase.from("technical_evals").insert({ student_id: studentId, [key]: value });
  }
}

// ═══════════════════ PHYSICAL EVALS ═══════════════════

export async function updatePhysicalEval(studentId, key, value) {
  const { data: existing } = await supabase
    .from("physical_evals")
    .select("id")
    .eq("student_id", studentId)
    .single();

  if (existing) {
    await supabase.from("physical_evals").update({ [key]: value }).eq("student_id", studentId);
  } else {
    await supabase.from("physical_evals").insert({ student_id: studentId, [key]: value });
  }
}

// ═══════════════════ INVOICES ═══════════════════

export async function updateInvoice(id, { amount, description, date }) {
  const { error } = await supabase
    .from("invoices")
    .update({ amount: Number(amount), description, date })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteInvoice(id) {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw error;
}

// ═══════════════════ BELT UPDATE (from progress page) ═══════════════════

export async function updateStudentBelt(id, field, value) {
  const { error } = await supabase
    .from("students")
    .update({ [field]: value })
    .eq("id", id);
  if (error) throw error;
}
