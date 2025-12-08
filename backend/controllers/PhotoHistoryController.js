const ServiceOrderPhoto = require('../models/ServiceOrderPhoto');
const ServiceOrder = require('../models/ServiceOrder');
const Company = require('../models/Company');
const User = require('../models/User');
const ClientBranch = require('../models/ClientBranch');
const { handleDatabaseError } = require('../utils/errorHandling');
const { Op } = require('sequelize');

// GET /api/photo-history/stats
exports.getStats = async (req, res) => {
  try {
    const totalPhotos = await ServiceOrderPhoto.count();
    
    const uniqueOrders = await ServiceOrderPhoto.count({
      distinct: true,
      col: 'service_order_id'
    });
    
    const uniqueClients = await ServiceOrderPhoto.count({
      distinct: true,
      col: 'company_id'
    });

    return res.status(200).json({
      success: true,
      data: {
        totalRecords: uniqueOrders,
        totalPhotos: totalPhotos,
        uniqueClients: uniqueClients
      }
    });

  } catch (error) {
    console.error('Erro stats:', error);
    return handleDatabaseError(res, error, 'buscar estatísticas de fotos');
  }
};

// GET /api/photo-history
exports.getAll = async (req, res) => {
  try {
    const { search, area, manager } = req.query;

    const photos = await ServiceOrderPhoto.findAll({
      include: [
        {
          model: ServiceOrder,
          as: 'serviceOrder',
          attributes: ['order_number', 'title'],
          required: false
        },
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'name'], // ✅ SEM main_area
          required: false
        },
        {
          model: ClientBranch,
          as: 'branch',
          attributes: ['name'],
          required: false
        },
        {
          model: User,
          as: 'collaborator',
          attributes: ['user_id', 'full_name'],
          required: false
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['user_id', 'full_name'],
          required: false
        }
      ],
      order: [['taken_at', 'DESC']]
    });

    // Agrupar por service_order_id
    const groupedMap = new Map();

    photos.forEach(photo => {
      const photoData = photo.toJSON();
      const key = photoData.service_order_id || photoData.photo_id;
      
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          id: `PHOTO-${String(photoData.photo_id).padStart(3, '0')}`,
          serviceRequestId: photoData.serviceOrder?.order_number || 'N/A',
          clientName: photoData.company?.name || 'N/A',
          clientArea: 'centro', // ✅ Valor padrão
          serviceType: photoData.serviceOrder?.title || 'Serviço',
          serviceDescription: photoData.description || '',
          collaboratorName: photoData.collaborator?.full_name || 'N/A',
          managerName: photoData.reviewer?.full_name || 'Sistema',
          uploadDate: new Date(photoData.taken_at).toLocaleDateString('pt-BR'),
          sentDate: photoData.reviewed_at 
            ? new Date(photoData.reviewed_at).toLocaleDateString('pt-BR')
            : new Date(photoData.taken_at).toLocaleDateString('pt-BR'),
          beforePhotos: [],
          afterPhotos: [],
          collaboratorNotes: '',
          managerNotes: photoData.review_notes || ''
        });
      }

      const record = groupedMap.get(key);
      
      if (photoData.photo_type === 'before') {
        record.beforePhotos.push(photoData.photo_url);
        if (photoData.description) {
          record.collaboratorNotes = photoData.description;
        }
      } else if (photoData.photo_type === 'after') {
        record.afterPhotos.push(photoData.photo_url);
      }
    });

    let records = Array.from(groupedMap.values());

    // Filtros
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      records = records.filter(r => 
        r.clientName.toLowerCase().includes(searchLower) ||
        r.collaboratorName.toLowerCase().includes(searchLower) ||
        r.managerName.toLowerCase().includes(searchLower) ||
        r.serviceType.toLowerCase().includes(searchLower) ||
        r.id.toLowerCase().includes(searchLower)
      );
    }

    if (area && area !== 'all') {
      records = records.filter(r => r.clientArea === area);
    }

    if (manager && manager !== 'all') {
      records = records.filter(r => r.managerName === manager);
    }

    return res.status(200).json({
      success: true,
      data: records
    });

  } catch (error) {
    console.error('Erro getAll:', error);
    return handleDatabaseError(res, error, 'buscar histórico de fotos');
  }
};

// GET /api/photo-history/:id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const photoId = parseInt(id.replace('PHOTO-', ''));

    const photo = await ServiceOrderPhoto.findByPk(photoId, {
      include: [
        {
          model: ServiceOrder,
          as: 'serviceOrder',
          attributes: ['order_number', 'title']
        },
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'name'] // ✅ SEM main_area
        },
        {
          model: User,
          as: 'collaborator',
          attributes: ['user_id', 'full_name']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['user_id', 'full_name']
        }
      ]
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Registro não encontrado'
      });
    }

    const photoData = photo.toJSON();

    return res.status(200).json({
      success: true,
      data: {
        id: `PHOTO-${String(photoData.photo_id).padStart(3, '0')}`,
        serviceRequestId: photoData.serviceOrder?.order_number || 'N/A',
        clientName: photoData.company?.name || 'N/A',
        clientArea: 'centro', // ✅ Valor padrão
        serviceType: photoData.serviceOrder?.title || 'Serviço',
        serviceDescription: photoData.description || '',
        collaboratorName: photoData.collaborator?.full_name || 'N/A',
        managerName: photoData.reviewer?.full_name || 'Sistema',
        uploadDate: new Date(photoData.taken_at).toLocaleDateString('pt-BR'),
        sentDate: photoData.reviewed_at 
          ? new Date(photoData.reviewed_at).toLocaleDateString('pt-BR')
          : new Date(photoData.taken_at).toLocaleDateString('pt-BR'),
        photoUrl: photoData.photo_url,
        photoType: photoData.photo_type,
        collaboratorNotes: photoData.description || '',
        managerNotes: photoData.review_notes || ''
      }
    });

  } catch (error) {
    console.error('Erro getById:', error);
    return handleDatabaseError(res, error, 'buscar foto');
  }
};