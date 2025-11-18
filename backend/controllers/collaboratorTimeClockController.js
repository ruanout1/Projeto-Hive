const TimeClockEntry = require('../models/TimeClockEntry');
const User = require('../models/User');
const { Op } = require('sequelize');

// @desc    Clock in
// @route   POST /api/collaborator-time-clock/clock-in
// @access  Private (Collaborator)
exports.clockIn = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const userId = req.user.id;

    // Check for an existing open time clock entry for the user
    const existingEntry = await TimeClockEntry.findOne({
      where: {
        userId,
        checkOutTime: null,
      },
    });

    if (existingEntry) {
      return res.status(400).json({ message: 'Já existe um registro de ponto em aberto.' });
    }

    const entry = await TimeClockEntry.create({
      userId,
      checkInTime: new Date(),
      checkInLatitude: latitude,
      checkInLongitude: longitude,
      checkInAddress: address,
      status: 'on-duty',
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Error clocking in:', error);
    res.status(500).json({ message: 'Erro ao registrar o ponto de entrada.', error: error.message });
  }
};

// @desc    Clock out
// @route   POST /api/collaborator-time-clock/clock-out
// @access  Private (Collaborator)
exports.clockOut = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const userId = req.user.id;

    const entry = await TimeClockEntry.findOne({
      where: {
        userId,
        checkOutTime: null,
        breakEndTime: { [Op.ne]: null }, // Ensure they have ended their break
      },
    });

    if (!entry) {
      return res.status(400).json({ message: 'Nenhum registro de ponto em aberto para encerrar.' });
    }

    entry.checkOutTime = new Date();
    entry.checkOutLatitude = latitude;
    entry.checkOutLongitude = longitude;
    entry.checkOutAddress = address;
    entry.status = 'present'; // Or calculate based on expected hours
    await entry.save();

    res.status(200).json(entry);
  } catch (error) {
    console.error('Error clocking out:', error);
    res.status(500).json({ message: 'Erro ao registrar o ponto de saída.', error: error.message });
  }
};

// @desc    Start break
// @route   POST /api/collaborator-time-clock/start-break
// @access  Private (Collaborator)
exports.startBreak = async (req, res) => {
    try {
        const userId = req.user.id;

        const entry = await TimeClockEntry.findOne({
            where: {
                userId,
                checkOutTime: null,
                breakStartTime: null,
            },
        });

        if (!entry) {
            return res.status(400).json({ message: 'Você precisa ter um registro de ponto de entrada para iniciar o intervalo.' });
        }

        entry.breakStartTime = new Date();
        entry.status = 'on-break';
        await entry.save();

        res.status(200).json(entry);
    } catch (error) {
        console.error('Error starting break:', error);
        res.status(500).json({ message: 'Erro ao registrar o início do intervalo.', error: error.message });
    }
};

// @desc    End break
// @route   POST /api/collaborator-time-clock/end-break
// @access  Private (Collaborator)
exports.endBreak = async (req, res) => {
    try {
        const userId = req.user.id;

        const entry = await TimeClockEntry.findOne({
            where: {
                userId,
                checkOutTime: null,
                breakStartTime: { [Op.ne]: null },
                breakEndTime: null,
            },
        });

        if (!entry) {
            return res.status(400).json({ message: 'Nenhum intervalo em andamento para encerrar.' });
        }

        entry.breakEndTime = new Date();
        entry.status = 'on-duty';
        await entry.save();

        res.status(200).json(entry);
    } catch (error) {
        console.error('Error ending break:', error);
        res.status(500).json({ message: 'Erro ao registrar o fim do intervalo.', error: error.message });
    }
};

// @desc    Get time clock history for the logged-in collaborator
// @route   GET /api/collaborator-time-clock/history
// @access  Private (Collaborator)
exports.getTimeClockHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await TimeClockEntry.findAll({
      where: { userId },
      order: [['checkInTime', 'DESC']],
    });
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching time clock history:', error);
    res.status(500).json({ message: 'Erro ao buscar o histórico de ponto.', error: error.message });
  }
};
