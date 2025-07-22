import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CertificateCard from '../components/CertificateCard';

const Verify = () => {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    if (tokenId) {
      verifyCertificate();
    } else {
      setError('No certificate ID provided');
      setLoading(false);
    }
  }, [tokenId]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the verification API
      const response = await fetch(`/api/v1/certificates/verify/${tokenId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Verification failed');
      }

      if (data.success) {
        setCertificate(data.data.certificate);
        setVerificationStatus(data.data.verification);
      } else {
        throw new Error('Certificate verification failed');
      }

    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryVerification = () => {
    verifyCertificate();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div