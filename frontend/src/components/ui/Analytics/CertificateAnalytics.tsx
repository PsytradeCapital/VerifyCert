import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Award, CheckCircle } from 'lucide-react';

interface AnalyticsData {
  totalCertificates: number;
  totalInstitutions: number;
  totalRecipients: number;
  verificationRate: number;
  monthlyIssuance: Array<{
    month: string;
    count: number;
  }>;
  topInstitutions: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

interface CertificateAnalyticsProps {
  data: AnalyticsData;
  className?: string;
}

export const CertificateAnalytics: React.FC<CertificateAnalyticsProps> = ({
  data,
  className = ''
}) => {
  const [animatedNumbers, setAnimatedNumbers] = useState({
    totalCertificates: 0,
    totalInstitutions: 0,
    totalRecipients: 0,
    verificationRate: 0
  });

  useEffect(() => {
    const animateNumbers = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        setAnimatedNumbers({
          totalCertificates: Math.floor(data.totalCertificates * easeOutQuart),
          totalInstitutions: Math.floor(data.totalInstitutions * easeOutQuart),
          totalRecipients: Math.floor(data.totalRecipients * easeOutQuart),
          verificationRate: Math.floor(data.verificationRate * easeOutQuart)
        });

        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedNumbers({
            totalCertificates: data.totalCertificates,
            totalInstitutions: data.totalInstitutions,
            totalRecipients: data.totalRecipients,
            verificationRate: data.verificationRate
          });
        }
      }, stepDuration);
    };

    animateNumbers();
  }, [data]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Certificates</p>
              <p className="text-2xl font-bold text-gray-900">{animatedNumbers.totalCertificates.toLocaleString()}</p>
            </div>
            <Award className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Institutions</p>
              <p className="text-2xl font-bold text-gray-900">{animatedNumbers.totalInstitutions.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recipients</p>
              <p className="text-2xl font-bold text-gray-900">{animatedNumbers.totalRecipients.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verification Rate</p>
              <p className="text-2xl font-bold text-gray-900">{animatedNumbers.verificationRate}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Issuance Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Certificate Issuance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyIssuance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Institutions Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Institutions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.topInstitutions}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.topInstitutions.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Institutions List */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Institution Rankings</h3>
        <div className="space-y-3">
          {data.topInstitutions.map((institution, index) => (
            <div key={institution.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{institution.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{institution.count.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{institution.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificateAnalytics;