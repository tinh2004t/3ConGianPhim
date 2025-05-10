const Comment = require('../models/comment.model');

exports.createComment = async (req, res) => {
  try {
    const { movieId, episodeId, content } = req.body;
    const comment = await Comment.create({
      movieId,
      episodeId,
      userId: req.user.userId,
      content
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Error creating comment' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { movieId, episodeId } = req.query;

    if (!movieId) {
      return res.status(400).json({ message: 'movieId is required' });
    }

    const filter = { movieId };
    if (episodeId) filter.episodeId = episodeId;

    const comments = await Comment.find(filter)
      .populate('userId', 'username')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};


exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Chỉ cho phép xóa nếu là admin hoặc chính chủ comment
    if (req.user.role !== 'admin' && comment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err); // ➜ log lỗi chi tiết
    res.status(500).json({ message: 'Error deleting comment' });
  }
};
