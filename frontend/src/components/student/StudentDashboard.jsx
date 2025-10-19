// Student Dashboard Main Component
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StudentLayout } from './StudentLayout';
import { StudentOverview } from './StudentOverview';
import { AvailableExams } from './AvailableExams';
import { MyResults } from './MyResults';
import { Profile } from './Profile';

export const StudentDashboard = () => {
  return (
    <StudentLayout>
      <Routes>
        <Route index element={<StudentOverview />} />
        <Route path="overview" element={<StudentOverview />} />
        <Route path="exams" element={<AvailableExams />} />
        <Route path="results" element={<MyResults />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/student/overview" replace />} />
      </Routes>
    </StudentLayout>
  );
};

export default StudentDashboard;