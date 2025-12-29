
const supabase = require('../config/supabase');

class CounsellorService {
  async getAllCounsellors() {
    const { data, error } = await supabase
      .from('counsellors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // Map DB fields to frontend-friendly fields
    const counsellors = data.map((c) => ({
      id: c.id,
      name: c.name,
      charges: c.charges,
      image: c.image,
      speciality: c.speciality,
      bio: c.bio,
      status: c.status,
      createdAt: new Date(c.created_at),
    }));

    return counsellors;
  }

  async getCounsellorById(id) {
    const { data, error } = await supabase
      .from('counsellors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      charges: data.charges,
      image: data.image,
      speciality: data.speciality,
      bio: data.bio,
      status: data.status,
      createdAt: new Date(data.created_at),
    };
  }
}

module.exports = new CounsellorService();