import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Award, Calendar } from 'lucide-react';
import Card from '../Card/Card';

export interface AnalyticsData {
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

interface CertificateAnalyticsProps {
data: AnalyticsData;
  className?: string;

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
    }, stepDuration);

    return () => clearInterval(interval);
  }, [data]);

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    suffix?: string;
  }> = ({ title, value, icon, color, suffix = '' }) => (
    <Card variant="elevated" padding="lg" hover className="text-center">
      <div className={inline-flex items-center justify-center w-12 h-12 rounded-full ${color} mb-4}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {value.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-gray-600">{title}</div>
    </Card>
  );

  return (
    <div className={space-y-6 ${className}}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Certificates"
          value={animatedNumbers.totalCertificates}
          color="bg-blue-500"
        />
        <StatCard
          title="Institutions"
          value={animatedNumbers.totalInstitutions}
          color="bg-green-500"
        />
        <StatCard
          title="Recipients"
          value={animatedNumbers.totalRecipients}
          color="bg-purple-500"
        />
        <StatCard
          title="Verification Rate"
          value={animatedNumbers.verificationRate}
          color="bg-orange-500"
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Monthly Issuance
          </h3>
          <div className="space-y-3">
            {data.monthlyIssuance.map((item, index) => {
              const maxValue = Math.max(...data.monthlyIssuance.map(d => d.count));
              return (
                <div key={item.month} className="flex items-center space-x-3">
                  <div className="w-16 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500 rounded-full"
                      initial={{ width: 0 }
                      animate={{ width: ${(item.count / maxValue) * 100}% }
                      transition={{ duration: 1, delay: index * 0.1 }
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {item.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Award className="w-5 h-5 mr-2 text-purple-600" />
            Top Institutions
          </h3>
          <div className="space-y-4">
            {data.topInstitutions.map((institution, index) => (
              <motion.div
                key={institution.name}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: -20 }
                animate={{ opacity: 1, x: 0 }
                transition={{ duration: 0.5, delay: index * 0.1 }
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{institution.name}</div>
                    <div className="text-sm text-gray-600">{institution.count} certificates</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{institution.percentage}%</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }
                      animate={{ width: ${institution.percentage}% }
                      transition={{ duration: 1, delay: index * 0.1 }
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
}
}