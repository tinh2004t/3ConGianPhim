const Schedule = require('../models/schedule.model');

exports.getSchedule = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate('movies');
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching schedule' });
  }
};

exports.upsertSchedule = async (req, res) => {
    console.log(req.body);
  try {
    const { dayOfWeek, movieIds, time } = req.body;

    const existing = await Schedule.findOne({ dayOfWeek });
    if (existing) {
      existing.movies = movieIds;
      await existing.save();
      return res.json({ message: 'Schedule updated', schedule: existing });
    }

    const newSchedule = await Schedule.create({ dayOfWeek, movies: movieIds, time });
    res.status(201).json({ message: 'Schedule created', schedule: newSchedule });
  } catch (err) {
    res.status(500).json({ message: 'Error updating schedule' });
  }
};
