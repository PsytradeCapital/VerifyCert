import React, { useState } from 'react';
import { useAuth } from '../cont';

interface Certificate {
  id: string;
  recipientName: string;
  courseName: string;
  institutionName: string;

  status: 'active' | 'revoked';
}

const IssuerDashboard{

  const [certificates] e[]>([
    {
      id: '1',
      recipientName: 'John Doe',

      institutionName: 'Tech Academy',
      issueDate: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
     h',

      institutionName: 'Crypto Univety',
      issueDate: '2024-01-10',
'
    }
  ]);

  if (!isAuthenti {
    return (
      <div className="ma
        <div classNam>
          <h1 classN
          <p class>
     d.
/p>
          <a 
            href="/login" 
            className="bg"
          >
            Sign In
     

      </div>
    );
  }

  return (
    <div className="
      <div className="mb
        <h1 cl
          Issuerd
       
        <p className="text-gray-600 dark:text-gray-3
         ere.
>
      </div>

      {/* Stats Cards */}
      <div className="gri>
        <div classNamd">
          <div classN">
       div>
            <div>
              /h3>
              <p clasth}</p>
            </div>
          </div>
        </div>

        <div className
          <div class>
       ">✅</div>
            <div>
         ve</h3>

                {certificates.filter(c => c.status === 'active').length}
              </p>
            </div>
v>
        </div>

        <div className=>
          <div className="flex items-center">
            <div className="text-3xl mr-4">👥</div>
            <div>
              <h3 className="texts</h3>
              <p className="text-2xl font-be">
                {new Set(certificates.map(c}
             </p>
            </div>
          </div>
        </div>

        <did">
          <div
            <div className="text-3xl mr-4">📊</div>
            <div>
              <h3 className="text-sm font-mh3>

            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-
        <h2 className="t
        <div className="flex flex-wrap gap-4">
          <button className="bg-bl0">
            Issficate
          </button>
          <button className="bg-gray-600 text-white px-6 py-3 rou700">
oad
          </button>
          <button className="bg-green-600 text-white px-6 p700">
            Export Reports
          </button>
        </div>
      </div>

/}
      <div className="bg-white dark:bg-gray-800 r
        <div className="px-6 py-4 border-b border-g>
          <h2es</h2>
v>
        <div className="overflow-x-auto">
          <table className="w-full">
            <00">
 <tr>
                <th className="px-6 py-3 text-left tex
                  Recipient
                </th>
              ">
  Course
                </th>
                <th className="px-6 py-3 text-left r">
                  Institution
              /th>

                  Issue Date
                </th>

              
                </th>
              </
            </t>
            <tbody className="bg-white da">
              {certi=> (
                <trt.id}>
                  <td className="px-6 py-">
       }
 </td>
                  <td className="px-6 py-4 whitespace-0">
                    {cert.courseName}
                  </td>
                  <">
                    {}
                  </td>
                  <td className=y-300">
                    {cert.issueDate}
                  </td>
                  <td className="px-6 py-4 whitespap">
                    <span className={`ll ${
                      cert.status ==' 
          00' 
'
                    }`}>
    tatus}
an>
                  </td>
                </tr>
              ))}
            </tbody>
          </tble>

      </div>
    </div>
  );
};

export dboard;uerDashefault Iss