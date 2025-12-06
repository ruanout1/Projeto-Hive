export interface PhotoSubmission {
  id: string;
  serviceRequestId: string;
  clientName: string;
  clientArea: string; // 'norte' | 'sul' etc.
  serviceType: string;
  serviceDescription: string;
  collaboratorName: string;
  collaboratorId: string;
  uploadDate: string;
  uploadTime: string;
  beforePhotos: string[];
  afterPhotos: string[];
  collaboratorNotes?: string;
  status: 'pending' | 'sent';
  managerNotes?: string;
  sentDate?: string;
  sentBy?: string;
}

export interface PhotoReviewFilters {
  status: 'pending' | 'sent' | 'all';
  search: string;
}

// Interface para edição de revisão
export interface EditReviewData {
  managerNotes?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
}