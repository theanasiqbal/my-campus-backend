const supabase = require('../config/supabase');

class RatingController {
    async createRating(req, res, next) {
        try {
            const { student_id, counsellor_id, appointment_id, rating, review } = req.body;

            if (!student_id || !counsellor_id || !appointment_id || !rating) {
                return res.status(400).json({ success: false, error: 'Missing required fields' });
            }

            const { data, error } = await supabase
                .from('counsellor_ratings')
                .insert([{
                    student_id,
                    counsellor_id,
                    appointment_id,
                    rating,
                    review
                }])
                .select('*')
                .single();

            if (error) {
                if (error.code === '23505') {
                    return res.status(400).json({ success: false, error: 'You have already reviewed this appointment.' });
                }
                throw error;
            }

            res.status(201).json({
                success: true,
                rating: data
            });
        } catch (error) {
            console.error('Create rating error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new RatingController();
