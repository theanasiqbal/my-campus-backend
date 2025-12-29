const counsellorService = require('../services/counsellorService');

class CounsellorController {
  async getCounsellors(req, res, next) {
    try {
      const counsellors = await counsellorService.getAllCounsellors();
      res.status(200).json({ counsellors });
    } catch (error) {
      next(error);
    }
  }

  async getCounsellorById(req, res, next) {
    try {
      const { id } = req.params;
      const counsellor = await counsellorService.getCounsellorById(id);
      res.status(200).json({ counsellor });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CounsellorController();