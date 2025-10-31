const { pastRatingsData } = require("../data/mockData");

exports.getRatings = (req, res) => res.json(pastRatingsData);

exports.postRating = (req, res) => {
  const newRating = req.body;
  console.log('✅ Nova avaliação recebida do frontend:', newRating);

  pastRatingsData.unshift(newRating);

  res.status(201).json({ message: 'Avaliação recebida com sucesso!', data: newRating });
};
