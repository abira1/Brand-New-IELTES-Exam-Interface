// Admin Dashboard Main Component
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminOverview } from './AdminOverview';
import ExamManagement from './ExamManagement';
import TrackManager from './TrackManager';
import { StudentManagement } from './StudentManagement';
import { SubmissionReview } from './SubmissionReview';
import { Analytics } from './Analytics';
import { Settings } from './Settings';

export const AdminDashboard = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="overview" element={<AdminOverview />} />
        <Route path="exams/*" element={<ExamManagement />} />
        <Route path="tracks/*" element={<TrackManager />} />
        <Route path="students/*" element={<StudentManagement />} />
        <Route path="submissions/*" element={<SubmissionReview />} />
        <Route path="analytics/*" element={<Analytics />} />
        <Route path="settings/*" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin/overview" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;