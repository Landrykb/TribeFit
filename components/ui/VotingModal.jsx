'use client';
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Vote, CheckCircle, XCircle, Users, Clock } from 'lucide-react';

export function VotingModal({ isOpen, onClose, pendingRequests, onVote }) {
  const [loading, setLoading] = useState({});

  const handleVote = async (requestId, vote) => {
    setLoading(prev => ({ ...prev, [requestId]: vote }));
    
    try {
      await onVote(requestId, vote);
    } finally {
      setLoading(prev => ({ ...prev, [requestId]: null }));
    }
  };

  const getStatusColor = (votes, totalMembers) => {
    const needed = Math.ceil(totalMembers / 2);
    if (votes.approve >= needed) return 'text-success';
    if (votes.reject >= needed) return 'text-danger';
    return 'text-warning';
  };

  const getStatusText = (votes, totalMembers) => {
    const needed = Math.ceil(totalMembers / 2);
    if (votes.approve >= needed) return 'APPROVED';
    if (votes.reject >= needed) return 'REJECTED';
    return 'PENDING';
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Tribe Voting Center" 
      size="lg"
    >
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <Vote size={48} className="text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400 mb-2">No pending votes</p>
            <p className="text-sm text-surface-500">
              When tribe members request equipment or donations, you'll see them here
            </p>
          </div>
        ) : (
          pendingRequests.map((request) => {
            const needed = Math.ceil(request.totalMembers / 2);
            const status = getStatusText(request.votes, request.totalMembers);
            const isCompleted = status !== 'PENDING';
            
            return (
              <div key={request.id} className="bg-surface-800 rounded-xl p-5 border border-surface-700">
                {/* Request Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-bold text-surface-50">{request.label}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.type === 'gear' 
                          ? 'bg-primary/20 text-primary border border-primary/30' 
                          : 'bg-accent/20 text-accent border border-accent/30'
                      }`}>
                        {request.type === 'gear' ? '🏋️ Equipment' : '❤️ Donation'}
                      </span>
                    </div>
                    <p className="text-surface-300 text-sm mb-3">
                      <strong className="text-accent">{request.amount} TC</strong> • 
                      Requested by <strong className="text-primary">{request.requestedBy}</strong>
                    </p>
                    
                    {request.description && (
                      <p className="text-surface-400 text-sm mb-3 italic">
                        "{request.description}"
                      </p>
                    )}
                  </div>
                  
                  <div className={`text-right ${getStatusColor(request.votes, request.totalMembers)}`}>
                    <div className="font-bold text-sm">{status}</div>
                    <div className="text-xs opacity-75">
                      {request.votes.approve + request.votes.reject} / {request.totalMembers} votes
                    </div>
                  </div>
                </div>

                {/* Voting Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-surface-400">Voting Progress</span>
                    <span className="text-surface-300">
                      {request.votes.approve} / {needed} needed to approve
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Approve Progress */}
                    <div className="flex items-center space-x-3">
                      <CheckCircle size={16} className="text-success flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-success">Approve</span>
                          <span className="text-surface-400">{request.votes.approve}</span>
                        </div>
                        <div className="w-full bg-surface-700 rounded-full h-2">
                          <div 
                            className="bg-success h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(100, (request.votes.approve / needed) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Reject Progress */}
                    <div className="flex items-center space-x-3">
                      <XCircle size={16} className="text-danger flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-danger">Reject</span>
                          <span className="text-surface-400">{request.votes.reject}</span>
                        </div>
                        <div className="w-full bg-surface-700 rounded-full h-2">
                          <div 
                            className="bg-danger h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(100, (request.votes.reject / needed) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voting Actions */}
                {!isCompleted && (
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleVote(request.id, 'approve')}
                      variant="success"
                      size="sm"
                      className="flex-1"
                      disabled={loading[request.id]}
                    >
                      {loading[request.id] === 'approve' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Voting...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Approve ({request.votes.approve})
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => handleVote(request.id, 'reject')}
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      disabled={loading[request.id]}
                    >
                      {loading[request.id] === 'reject' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Voting...
                        </>
                      ) : (
                        <>
                          <XCircle size={16} />
                          Reject ({request.votes.reject})
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {isCompleted && (
                  <div className={`text-center py-2 px-4 rounded-lg ${
                    status === 'APPROVED' 
                      ? 'bg-success/20 text-success border border-success/30' 
                      : 'bg-danger/20 text-danger border border-danger/30'
                  }`}>
                    <div className="flex items-center justify-center space-x-2">
                      {status === 'APPROVED' ? (
                        <CheckCircle size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      <span className="font-medium">
                        {status === 'APPROVED' ? 'Request Approved!' : 'Request Rejected'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      <div className="flex justify-center pt-6 border-t border-surface-700">
        <Button 
          onClick={onClose}
          variant="ghost"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}