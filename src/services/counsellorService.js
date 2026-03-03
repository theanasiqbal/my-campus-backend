
const supabase = require('../config/supabase');

class CounsellorService {
  async getAllCounsellors() {
    const { data, error } = await supabase
      .from('counsellors')
      .select('*, counsellor_ratings(rating)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // Map DB fields to frontend-friendly fields
    const counsellors = data.map((c) => {
      const ratings = c.counsellor_ratings || [];
      const reviewCount = ratings.length;
      const ratingAvg = reviewCount > 0
        ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
        : 5.0; // Default if no ratings

      return {
        id: c.id,
        name: c.name,
        charges: c.charges,
        image: c.image,
        speciality: c.speciality,
        bio: c.bio,
        status: c.status,
        ratingAvg,
        reviewCount,
        createdAt: new Date(c.created_at),
      };
    });

    return counsellors;
  }

  async getCounsellorById(id) {
    const { data, error } = await supabase
      .from('counsellors')
      .select('*, counsellor_ratings(rating)')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const ratings = data.counsellor_ratings || [];
    const reviewCount = ratings.length;
    const ratingAvg = reviewCount > 0
      ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
      : 5.0; // Default if no ratings

    return {
      id: data.id,
      name: data.name,
      charges: data.charges,
      image: data.image,
      speciality: data.speciality,
      bio: data.bio,
      status: data.status,
      ratingAvg,
      reviewCount,
      createdAt: new Date(data.created_at),
    };
  }
}

module.exports = new CounsellorService();