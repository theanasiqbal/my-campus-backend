const supabase = require('../config/supabase');

// Get all conversations for a student
exports.getStudentInbox = async (req, res) => {
    try {
        const { studentId } = req.params;

        const { data, error } = await supabase
            .from('conversations')
            .select('*, counsellors(*)')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({
            success: true,
            conversations: data
        });
    } catch (error) {
        console.error('Get student inbox error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get all conversations for a counsellor
exports.getCounsellorInbox = async (req, res) => {
    try {
        const { counsellorId } = req.params;

        const { data, error } = await supabase
            .from('conversations')
            .select('*, students(*)')
            .eq('counsellor_id', counsellorId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({
            success: true,
            conversations: data
        });
    } catch (error) {
        console.error('Get counsellor inbox error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
