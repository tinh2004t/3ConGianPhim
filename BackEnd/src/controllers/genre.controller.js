const Genre = require('../models/genre.model');

// Lấy danh sách thể loại
exports.getGenres = async (req, res) => {
  try {
    const genres = await Genre.find();
    res.status(200).json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm thể loại (chỉ admin)
exports.createGenre = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newGenre = new Genre({ name, description });

    await newGenre.save();
    res.status(201).json(newGenre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thể loại (chỉ admin)
exports.updateGenre = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const genre = await Genre.findByIdAndUpdate(id, { name, description }, { new: true });
    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }
    res.status(200).json(genre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa thể loại (chỉ admin)
exports.deleteGenre = async (req, res) => {
  const { id } = req.params;

  try {
    const genre = await Genre.findByIdAndDelete(id);
    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }
    res.status(200).json({ message: 'Genre deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
