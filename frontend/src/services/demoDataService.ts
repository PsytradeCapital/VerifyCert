interface DemoCertificate {
  id: string;
  recipientName: string;
  courseName: string;
  institutionName: string;
  issueDate: string;
  status: 'valid' | 'revoked';
  issuer: string;
  recipient: string;
}

interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'issuer' | 'admin';
  certificates: DemoCertificate[];
}

class DemoDataService {
  private certificates: DemoCertificate[] = [
    {
      id: '1',
      recipientName: 'John Doe',
      courseName: 'Blockchain Fundamentals',
      institutionName: 'Tech University',
      issueDate: '2024-01-15',
      status: 'valid',
      issuer: '0x1234567890123456789012345678901234567890',
      recipient: '0x0987654321098765432109876543210987654321'
    }
  ];

  private users: DemoUser[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      certificates: []
    }
  ];

  getDemoCertificates(): DemoCertificate[] {
    return [...this.certificates];
  }

  getDemoCertificate(id: string): DemoCertificate | null {
    return this.certificates.find(cert => cert.id === id) || null;
  }

  getDemoUsers(): DemoUser[] {
    return [...this.users];
  }

  getDemoUser(id: string): DemoUser | null {
    return this.users.find(user => user.id === id) || null;
  }

  addDemoCertificate(certificate: Omit<DemoCertificate, 'id'>): DemoCertificate {
    const newCertificate: DemoCertificate = {
      ...certificate,
      id: (this.certificates.length + 1).toString()
    };
    
    this.certificates.push(newCertificate);
    return newCertificate;
  }

  getStatistics() {
    const totalCertificates = this.certificates.length;
    const validCertificates = this.certificates.filter(cert => cert.status === 'valid').length;
    const revokedCertificates = this.certificates.filter(cert => cert.status === 'revoked').length;

    return {
      totalCertificates,
      validCertificates,
      revokedCertificates
    };
  }
}

export const demoDataService = new DemoDataService();
export type { DemoCertificate, DemoUser };