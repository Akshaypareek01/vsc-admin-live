"use client";
import React, { Fragment, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Pageheader from "@/shared/layout-components/page-header/pageheader";
import Seo from "@/shared/layout-components/seo/seo";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import axios from "axios";
import { Base_url } from "@/app/api/config/BaseUrl";
import Select from "react-select";

interface FormData {
  // General Information
  name: string;
  email: string;
  password: string;
  mobileNumber: string;
  role: string;
  status: string;
  profilePicture: File | null;
  onboardingStatus: string;
  
  // Address
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  
  // KYC Details
  kycStatus: string;
  kycDetails: {
    aadhaarNumber: string;
    aadhaarVerified: boolean;
    aadhaarVerificationDate: Date | null;
    panNumber: string;
    panVerified: boolean;
    panVerificationDate: Date | null;
    documents: Array<{
      type: string;
      url: string;
      verified: boolean;
      verifiedBy: string | null;
      verifiedAt: Date | null;
      rejectionReason: string;
      uploadedAt: Date;
    }>;
  };
  
  // Bank Details
  bankAccounts: string[];
  
  // Statistics
  totalCommission: number;
  totalLeads: number;
  totalSales: number;
  lastLogin: Date | null;
  
  // Verification
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  emailVerification: {
    token: string;
    expiresAt: Date | null;
    verified: boolean;
  };
  mobileVerification: {
    token: string;
    expiresAt: Date | null;
    verified: boolean;
  };
  otp: {
    code: string;
    expiresAt: Date | null;
    attempts: number;
  };
  
  // Metadata
  metadata: {
    notes?: string;
    description?: string;
    [key: string]: any;
  };
}

const EditUser = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    role: "user",
    status: "pending",
    profilePicture: null,
    onboardingStatus: "pending",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India"
    },
    kycStatus: "pending",
    kycDetails: {
      aadhaarNumber: "",
      aadhaarVerified: false,
      aadhaarVerificationDate: null,
      panNumber: "",
      panVerified: false,
      panVerificationDate: null,
      documents: []
    },
    bankAccounts: [],
    totalCommission: 0,
    totalLeads: 0,
    totalSales: 0,
    lastLogin: null,
    isEmailVerified: false,
    isMobileVerified: false,
    emailVerification: {
      token: "",
      expiresAt: null,
      verified: false
    },
    mobileVerification: {
      token: "",
      expiresAt: null,
      verified: false
    },
    otp: {
      code: "",
      expiresAt: null,
      attempts: 0
    },
    metadata: {
      notes: "",
      description: ""
    }
  });

  const tabs = [
    { name: 'General Information', icon: 'ri-user-line' },
    { name: 'Address', icon: 'ri-map-pin-line' },
    { name: 'KYC Details', icon: 'ri-file-list-3-line' },
    { name: 'Bank Details', icon: 'ri-bank-line' },
    { name: 'Statistics', icon: 'ri-line-chart-line' },
    { name: 'Verification', icon: 'ri-shield-check-line' },
    { name: 'Metadata', icon: 'ri-settings-4-line' }
  ];

  useEffect(() => {
    if (userId) {
      fetchUserData();
    } else {
      router.push('/users');
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setInitialLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${Base_url}users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const userData = response.data;
      if (userData.lastLogin) {
        userData.lastLogin = new Date(userData.lastLogin);
      }
      if (userData.emailVerification?.expiresAt) {
        userData.emailVerification.expiresAt = new Date(userData.emailVerification.expiresAt);
      }
      if (userData.mobileVerification?.expiresAt) {
        userData.mobileVerification.expiresAt = new Date(userData.mobileVerification.expiresAt);
      }
      if (userData.otp?.expiresAt) {
        userData.otp.expiresAt = new Date(userData.otp.expiresAt);
      }
      
      // Ensure metadata object exists
      if (!userData.metadata) {
        userData.metadata = {
          notes: '',
          description: ''
        };
      }
      
      setFormData(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.patch(`${Base_url}users/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      router.push('/users');
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Fragment>
      <Seo title={"Edit User"} />
      <Pageheader currentpage="Edit User" activepage="Users" mainpage="Edit User" />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <div className="box">
            <div className="box-header">
              <h5 className="box-title">Edit User</h5>
            </div>
            <div className="box-body">
              <div className="flex space-x-2 border-b border-gray-200">
                {tabs.map((tab, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none ${
                      activeTab === index
                        ? 'bg-primary text-white'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab(index)}
                  >
                    <i className={`${tab.icon} mr-2`}></i>
                    {tab.name}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                {activeTab === 0 && (
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">Password (leave blank to keep current)</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">Mobile Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">Role</label>
                      <Select
                        options={[
                          { value: 'user', label: 'User' },
                          { value: 'admin', label: 'Admin' }
                        ]}
                        value={{ value: formData.role, label: formData.role.charAt(0).toUpperCase() + formData.role.slice(1) }}
                        onChange={(option) => setFormData({...formData, role: option?.value || 'user'})}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">Status</label>
                      <Select
                        options={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'active', label: 'Active' },
                          { value: 'inactive', label: 'Inactive' },
                          { value: 'suspended', label: 'Suspended' }
                        ]}
                        value={{ value: formData.status, label: formData.status.charAt(0).toUpperCase() + formData.status.slice(1) }}
                        onChange={(option) => setFormData({...formData, status: option?.value || 'pending'})}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">Onboarding Status</label>
                      <Select
                        options={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'in_progress', label: 'In Progress' },
                          { value: 'completed', label: 'Completed' },
                          { value: 'rejected', label: 'Rejected' }
                        ]}
                        value={{ value: formData.onboardingStatus, label: formData.onboardingStatus.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }}
                        onChange={(option) => setFormData({...formData, onboardingStatus: option?.value || 'pending'})}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">Profile Picture</label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) => setFormData({...formData, profilePicture: e.target.files?.[0] || null})}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 1 && (
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                      <label className="form-label">Street</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.street}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: {...formData.address, street: e.target.value}
                        })}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: {...formData.address, city: e.target.value}
                        })}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.state}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: {...formData.address, state: e.target.value}
                        })}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">Pincode</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.pincode}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: {...formData.address, pincode: e.target.value}
                        })}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">Country</label>
                      <Select
                        options={[
                          { value: 'India', label: 'India' },
                          { value: 'USA', label: 'USA' },
                          { value: 'UK', label: 'UK' }
                        ]}
                        value={{ value: formData.address.country, label: formData.address.country }}
                        onChange={(option) => setFormData({
                          ...formData,
                          address: {...formData.address, country: option?.value || 'India'}
                        })}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 2 && (
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                      <label className="form-label">KYC Status</label>
                      <Select
                        options={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'verified', label: 'Verified' },
                          { value: 'rejected', label: 'Rejected' }
                        ]}
                        value={{ value: formData.kycStatus, label: formData.kycStatus.charAt(0).toUpperCase() + formData.kycStatus.slice(1) }}
                        onChange={(option) => setFormData({...formData, kycStatus: option?.value || 'pending'})}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">Aadhaar Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.kycDetails.aadhaarNumber}
                        onChange={(e) => setFormData({
                          ...formData,
                          kycDetails: {...formData.kycDetails, aadhaarNumber: e.target.value}
                        })}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">PAN Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.kycDetails.panNumber}
                        onChange={(e) => setFormData({
                          ...formData,
                          kycDetails: {...formData.kycDetails, panNumber: e.target.value}
                        })}
                      />
                    </div>
                    <div className="col-span-12">
                      <label className="form-label">Documents</label>
                      <div className="space-y-4">
                        {formData.kycDetails.documents.map((doc, index) => (
                          <div key={index} className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                              <Select
                                options={[
                                  { value: 'aadhaar', label: 'Aadhaar' },
                                  { value: 'pan', label: 'PAN' },
                                  { value: 'addressProof', label: 'Address Proof' },
                                  { value: 'photo', label: 'Photo' },
                                  { value: 'other', label: 'Other' }
                                ]}
                                value={{ value: doc.type, label: doc.type.charAt(0).toUpperCase() + doc.type.slice(1) }}
                                onChange={(option) => {
                                  const newDocs = [...formData.kycDetails.documents];
                                  newDocs[index] = {...doc, type: option?.value || 'other'};
                                  setFormData({
                                    ...formData,
                                    kycDetails: {...formData.kycDetails, documents: newDocs}
                                  });
                                }}
                              />
                            </div>
                            <div className="col-span-6">
                              <input
                                type="file"
                                className="form-control"
                                onChange={(e) => {
                                  const newDocs = [...formData.kycDetails.documents];
                                  newDocs[index] = {...doc, url: e.target.files?.[0]?.name || ''};
                                  setFormData({
                                    ...formData,
                                    kycDetails: {...formData.kycDetails, documents: newDocs}
                                  });
                                }}
                              />
                            </div>
                            <div className="col-span-2">
                              <button
                                type="button"
                                className="ti-btn ti-btn-danger"
                                onClick={() => {
                                  const newDocs = formData.kycDetails.documents.filter((_, i) => i !== index);
                                  setFormData({
                                    ...formData,
                                    kycDetails: {...formData.kycDetails, documents: newDocs}
                                  });
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="ti-btn ti-btn-primary"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              kycDetails: {
                                ...formData.kycDetails,
                                documents: [...formData.kycDetails.documents, {
                                  type: 'other',
                                  url: '',
                                  verified: false,
                                  verifiedBy: null,
                                  verifiedAt: null,
                                  rejectionReason: '',
                                  uploadedAt: new Date()
                                }]
                              }
                            });
                          }}
                        >
                          Add Document
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 3 && (
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12">
                      <label className="form-label">Bank Accounts</label>
                      <div className="space-y-4">
                        {formData.bankAccounts.map((account, index) => (
                          <div key={index} className="grid grid-cols-12 gap-4">
                            <div className="col-span-10">
                              <input
                                type="text"
                                className="form-control"
                                value={account}
                                onChange={(e) => {
                                  const newAccounts = [...formData.bankAccounts];
                                  newAccounts[index] = e.target.value;
                                  setFormData({...formData, bankAccounts: newAccounts});
                                }}
                              />
                            </div>
                            <div className="col-span-2">
                              <button
                                type="button"
                                className="ti-btn ti-btn-danger"
                                onClick={() => {
                                  const newAccounts = formData.bankAccounts.filter((_, i) => i !== index);
                                  setFormData({...formData, bankAccounts: newAccounts});
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="ti-btn ti-btn-primary"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              bankAccounts: [...formData.bankAccounts, '']
                            });
                          }}
                        >
                          Add Bank Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 4 && (
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                      <label className="form-label">Total Commission</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.totalCommission}
                        onChange={(e) => setFormData({...formData, totalCommission: Number(e.target.value)})}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">Total Leads</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.totalLeads}
                        onChange={(e) => setFormData({...formData, totalLeads: Number(e.target.value)})}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">Total Sales</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.totalSales}
                        onChange={(e) => setFormData({...formData, totalSales: Number(e.target.value)})}
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">Last Login</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.lastLogin ? new Date(formData.lastLogin).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setFormData({...formData, lastLogin: e.target.value ? new Date(e.target.value) : null})}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 5 && (
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                      <label className="form-label">Email Verification</label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox"
                            checked={formData.isEmailVerified}
                            onChange={(e) => setFormData({...formData, isEmailVerified: e.target.checked})}
                          />
                          <span className="ml-2">Email Verified</span>
                        </div>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Verification Token"
                          value={formData.emailVerification.token}
                          onChange={(e) => setFormData({
                            ...formData,
                            emailVerification: {...formData.emailVerification, token: e.target.value}
                          })}
                        />
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.emailVerification.expiresAt ? new Date(formData.emailVerification.expiresAt).toISOString().slice(0, 16) : ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            emailVerification: {...formData.emailVerification, expiresAt: e.target.value ? new Date(e.target.value) : null}
                          })}
                        />
                      </div>
                    </div>
                    <div className="col-span-6">
                      <label className="form-label">Mobile Verification</label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox"
                            checked={formData.isMobileVerified}
                            onChange={(e) => setFormData({...formData, isMobileVerified: e.target.checked})}
                          />
                          <span className="ml-2">Mobile Verified</span>
                        </div>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Verification Token"
                          value={formData.mobileVerification.token}
                          onChange={(e) => setFormData({
                            ...formData,
                            mobileVerification: {...formData.mobileVerification, token: e.target.value}
                          })}
                        />
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.mobileVerification.expiresAt ? new Date(formData.mobileVerification.expiresAt).toISOString().slice(0, 16) : ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            mobileVerification: {...formData.mobileVerification, expiresAt: e.target.value ? new Date(e.target.value) : null}
                          })}
                        />
                      </div>
                    </div>
                    <div className="col-span-12">
                      <label className="form-label">OTP Details</label>
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="OTP Code"
                            value={formData.otp.code}
                            onChange={(e) => setFormData({
                              ...formData,
                              otp: {...formData.otp, code: e.target.value}
                            })}
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="datetime-local"
                            className="form-control"
                            value={formData.otp.expiresAt ? new Date(formData.otp.expiresAt).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              otp: {...formData.otp, expiresAt: e.target.value ? new Date(e.target.value) : null}
                            })}
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Attempts"
                            value={formData.otp.attempts}
                            onChange={(e) => setFormData({
                              ...formData,
                              otp: {...formData.otp, attempts: Number(e.target.value)}
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 6 && (
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12">
                      <label className="form-label">Additional Notes</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={formData.metadata?.notes || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            notes: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div className="col-span-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={formData.metadata?.description || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            description: e.target.value
                          }
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="box-footer flex justify-end space-x-2">
                <button
                  type="button"
                  className="ti-btn ti-btn-light"
                  onClick={() => router.back()}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="hs-dropdown-toggle ti-btn ti-btn-primary-full !py-1 !px-2 !text-[0.75rem]"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default function ProtectedEditUser() {
  return (
    <ProtectedRoute>
      <EditUser />
    </ProtectedRoute>
  );
} 