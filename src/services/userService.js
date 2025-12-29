const supabaseAdmin = require("../config/supabase");

class UserService {
  // Register new user
  async register(userData) {
    const { name, email, phone } = userData;

    // Check if phone already exists
    if (phone) {
      const { data: existingPhone } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("phone", phone)
        .single();

      if (existingPhone) {
        throw new Error("User with this phone number already exists");
      }
    }

    // Check if email already exists
    if (email) {
      const { data: existingEmail } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (existingEmail) {
        throw new Error("User with this email already exists");
      }
    }

    // Insert user
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert([
        {
          name,
          email: email || null,
          phone: phone || null,
          role: "student"
        },
      ])
      .select()
      .single();

    const { error: studentError } = await supabaseAdmin
      .from("students")
      .insert({
        id: user.id, // 👈 keep IDs in sync
        name,
        email: email || null,
        phone: phone || null,
      });

    if (studentError) {
      // rollback user insert if student insert fails
      await supabaseAdmin.from("users").delete().eq("id", user.id);
      throw new Error(studentError.message);
    }

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.created_at,
    };
  }

  // Login user with phone number
  async loginWithPhone(phone) {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("phone", phone)
      .single();

    if (error || !user) {
      throw new Error("Phone number not registered");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.created_at,
    };
  }

  // Login user with email
  async loginWithEmail(email) {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      throw new Error("Email not registered");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.created_at,
    };
  }

  // Get user by ID
  async getUserById(userId) {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      createdAt: data.created_at,
    };
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    const { name, email, phone } = updateData;

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      createdAt: data.created_at,
    };
  }

  // Check if phone exists
  async checkPhoneExists(phone) {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("phone", phone)
      .single();

    return { exists: !!data && !error };
  }
}

module.exports = new UserService();
