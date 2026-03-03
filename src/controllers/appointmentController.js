const supabase = require("../config/supabase");

// Create appointment (from BookConsultation2 -> Payments)
exports.createAppointment = async (req, res) => {
  try {
    const {
      student_id,
      counsellor_id,
      counselee_name,
      counselee_phone,
      counselee_email,
      counselee_gender,
      counselee_birth_date,
      counselee_address,
      amount,
      appointment_date,
      appointment_location
    } = req.body;

    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        student_id,
        counsellor_id,
        counselee_name,
        counselee_phone,
        counselee_email,
        counselee_gender,
        counselee_birth_date,
        counselee_address,
        amount,
        appointment_date,
        appointment_location,
        status: 'pending'
      }])
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      appointment: data
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Mark as paid (when user clicks Google Pay)
exports.markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'paid' })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    // Ensure a conversation exists for this student and counsellor pair
    if (data && data.student_id && data.counsellor_id) {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('student_id', data.student_id)
        .eq('counsellor_id', data.counsellor_id)
        .single();

      // If no conversation found (PGRST116 means zero rows), create one
      if (convError && convError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('conversations')
          .insert([{
            student_id: data.student_id,
            counsellor_id: data.counsellor_id
          }]);
        if (insertError) {
          console.error('Error creating conversation:', insertError);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment successful',
      appointment: data
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get student's appointments (for chat list)
exports.getStudentAppointments = async (req, res) => {
  try {
    const { studentId } = req.params;

    const { data, error } = await supabase
      .from('appointments')
      .select('*, counsellors(*), counsellor_ratings(id)')
      .eq('student_id', studentId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({
      success: true,
      appointments: data
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get counsellor's appointments (for chat list)
exports.getCounsellorAppointments = async (req, res) => {
  try {
    const { counsellorId } = req.params;

    const { data, error } = await supabase
      .from('appointments')
      .select('*, students(*)')
      .eq('counsellor_id', counsellorId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      appointments: data
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single appointment details
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('appointments')
      .select('*, counsellors(*), students(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      appointment: data
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get counsellor dashboard stats
exports.getCounsellorDashboard = async (req, res) => {
  try {
    const { counsellorId } = req.params;

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('counsellor_id', counsellorId);

    if (error) throw error;

    // Calculate stats
    const stats = {
      totalAppointments: data.length,
      totalEarnings: data
        .filter(apt => apt.status === 'paid' || apt.status === 'completed')
        .reduce((sum, apt) => sum + apt.amount, 0),
      pendingAppointments: data.filter(apt => apt.status === 'pending').length,
      completedAppointments: data.filter(apt => apt.status === 'completed').length,
      paidAppointments: data.filter(apt => apt.status === 'paid').length,
      cancelledAppointments: data.filter(apt => apt.status === 'cancelled').length,
      recentAppointments: data
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
    };

    res.status(200).json({
      success: true,
      stats,
      appointments: data
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};