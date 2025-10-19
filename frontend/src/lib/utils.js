// Utility functions
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const calculateBandScore = (rawScore, maxScore) => {
  const percentage = (rawScore / maxScore) * 100;
  
  if (percentage >= 90) return 9.0;
  if (percentage >= 80) return 8.0;
  if (percentage >= 70) return 7.0;
  if (percentage >= 60) return 6.0;
  if (percentage >= 50) return 5.0;
  if (percentage >= 40) return 4.0;
  if (percentage >= 30) return 3.0;
  if (percentage >= 20) return 2.0;
  return 1.0;
};

export const getBandLevel = (score) => {
  if (score >= 8.5) return { level: 'C2', label: 'Expert User' };
  if (score >= 7.0) return { level: 'C1', label: 'Good User' };
  if (score >= 6.0) return { level: 'B2', label: 'Competent User' };
  if (score >= 5.0) return { level: 'B1', label: 'Modest User' };
  if (score >= 4.0) return { level: 'A2', label: 'Limited User' };
  return { level: 'A1', label: 'Extremely Limited User' };
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const sanitizeHtml = (html) => {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

export const exportToCSV = (data, filename) => {
  const csvContent = "data:text/csv;charset=utf-8," + 
    data.map(row => Object.values(row).join(",")).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};