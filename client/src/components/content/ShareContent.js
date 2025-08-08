import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  createShare,
  getShares,
  getShare,
  updateShare,
  deleteShare,
  toggleShareStatus,
  addComment,
  addReply,
  recordDownload
} from '../../actions/share';
import { setAlert } from '../../actions/alert';
import Modal from '../layout/Modal';
import Spinner from '../layout/Spinner';

const ShareContent = ({
  auth,
  share,
  createShare,
  getShares,
  getShare,
  updateShare,
  deleteShare,
  toggleShareStatus,
  addComment,
  addReply,
  recordDownload,
  setAlert,
  content,
  contentType,
  history,
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    shareType: 'link',
    recipients: '',
    permissions: {
      canView: true,
      canEdit: false,
      canComment: true,
      canShare: false,
      canDownload: false
    },
    settings: {
      requireLogin: false,
      password: '',
      expirationDate: '',
      allowComments: true,
      showAnalytics: false
    }
  });

  const [activeTab, setActiveTab] = useState('create');
  const [selectedShare, setSelectedShare] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const {
    shareType,
    recipients,
    permissions,
    settings
  } = formData;

  useEffect(() => {
    if (isOpen && content) {
      getShares();
    }
  }, [isOpen, content, getShares]);

  const onChange = e => {
    if (e.target.name.includes('.')) {
      const [parent, child] = e.target.name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
        }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    const shareData = {
      contentId: content._id,
      contentType,
      shareType,
      recipients: shareType === 'email' || shareType === 'user' ? recipients.split(',').map(r => r.trim()) : [],
      permissions,
      settings: {
        ...settings,
        expirationDate: settings.expirationDate ? new Date(settings.expirationDate) : null
      }
    };

    try {
      await createShare(shareData);
      setAlert('Content shared successfully', 'success');
      getShares();
      setFormData({
        ...formData,
        recipients: ''
      });
    } catch (err) {
      setAlert('Error sharing content', 'danger');
    }
  };

  const handleUpdateShare = async () => {
    if (!selectedShare) return;
    
    const shareData = {
      recipients: selectedShare.shareType === 'email' || selectedShare.shareType === 'user' 
        ? recipients.split(',').map(r => r.trim()) 
        : [],
      permissions,
      settings: {
        ...settings,
        expirationDate: settings.expirationDate ? new Date(settings.expirationDate) : null
      }
    };

    try {
      await updateShare(selectedShare._id, shareData);
      setAlert('Share updated successfully', 'success');
      getShares();
      setSelectedShare(null);
    } catch (err) {
      setAlert('Error updating share', 'danger');
    }
  };

  const handleDeleteShare = async shareId => {
    if (window.confirm('Are you sure you want to delete this share?')) {
      try {
        await deleteShare(shareId);
        setAlert('Share deleted successfully', 'success');
        getShares();
      } catch (err) {
        setAlert('Error deleting share', 'danger');
      }
    }
  };

  const handleToggleShareStatus = async shareId => {
    try {
      await toggleShareStatus(shareId);
      setAlert('Share status updated', 'success');
      getShares();
    } catch (err) {
      setAlert('Error updating share status', 'danger');
    }
  };

  const handleSelectShare = share => {
    setSelectedShare(share);
    setFormData({
      shareType: share.shareType,
      recipients: share.recipients.join(', '),
      permissions: share.permissions,
      settings: share.settings
    });
    setActiveTab('manage');
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedShare) return;
    
    try {
      await addComment(selectedShare._id, newComment);
      setAlert('Comment added successfully', 'success');
      setNewComment('');
      getShare(selectedShare._id);
    } catch (err) {
      setAlert('Error adding comment', 'danger');
    }
  };

  const handleAddReply = async commentIndex => {
    if (!replyText.trim() || !selectedShare) return;
    
    try {
      await addReply(selectedShare._id, commentIndex, replyText);
      setAlert('Reply added successfully', 'success');
      setReplyText('');
      setReplyingTo(null);
      getShare(selectedShare._id);
    } catch (err) {
      setAlert('Error adding reply', 'danger');
    }
  };

  const handleCopyLink = shareToken => {
    const link = `${window.location.origin}/shared/${shareToken}`;
    navigator.clipboard.writeText(link);
    setAlert('Link copied to clipboard', 'success');
  };

  const handleDownload = async () => {
    if (!selectedShare) return;
    
    try {
      await recordDownload(selectedShare._id);
      // In a real implementation, you would trigger the actual download here
      setAlert('Download recorded', 'success');
    } catch (err) {
      setAlert('Error recording download', 'danger');
    }
  };

  const renderCreateShare = () => (
    <div className="share-create">
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="shareType">Share Type</label>
          <select
            className="form-control"
            id="shareType"
            name="shareType"
            value={shareType}
            onChange={onChange}
          >
            <option value="link">Shareable Link</option>
            <option value="email">Email</option>
            <option value="user">Specific Users</option>
            <option value="group">Group</option>
            <option value="public">Public</option>
          </select>
        </div>

        {(shareType === 'email' || shareType === 'user' || shareType === 'group') && (
          <div className="form-group">
            <label htmlFor="recipients">
              {shareType === 'email' ? 'Email Addresses' : 
               shareType === 'user' ? 'User IDs' : 'Group Names'}
              <small className="form-text text-muted">
                Separate multiple entries with commas
              </small>
            </label>
            <textarea
              className="form-control"
              id="recipients"
              name="recipients"
              value={recipients}
              onChange={onChange}
              rows="3"
            ></textarea>
          </div>
        )}

        <div className="form-group">
          <label>Permissions</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="canView"
              name="permissions.canView"
              checked={permissions.canView}
              onChange={onChange}
              disabled
            />
            <label className="form-check-label" htmlFor="canView">
              Can View
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="canEdit"
              name="permissions.canEdit"
              checked={permissions.canEdit}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="canEdit">
              Can Edit
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="canComment"
              name="permissions.canComment"
              checked={permissions.canComment}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="canComment">
              Can Comment
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="canShare"
              name="permissions.canShare"
              checked={permissions.canShare}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="canShare">
              Can Share
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="canDownload"
              name="permissions.canDownload"
              checked={permissions.canDownload}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="canDownload">
              Can Download
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Settings</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="requireLogin"
              name="settings.requireLogin"
              checked={settings.requireLogin}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="requireLogin">
              Require Login
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="allowComments"
              name="settings.allowComments"
              checked={settings.allowComments}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="allowComments">
              Allow Comments
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="showAnalytics"
              name="settings.showAnalytics"
              checked={settings.showAnalytics}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="showAnalytics">
              Show Analytics
            </label>
          </div>
          <div className="form-group mt-2">
            <label htmlFor="password">Password (optional)</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="settings.password"
              value={settings.password}
              onChange={onChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="expirationDate">Expiration Date (optional)</label>
            <input
              type="date"
              className="form-control"
              id="expirationDate"
              name="settings.expirationDate"
              value={settings.expirationDate}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="form-group">
          <button type="submit" className="btn btn-primary">
            Share Content
          </button>
        </div>
      </form>
    </div>
  );

  const renderManageShares = () => (
    <div className="share-manage">
      {share.loading ? (
        <Spinner />
      ) : (
        <>
          <div className="mb-4">
            <h5>Existing Shares</h5>
            {share.shares && share.shares.length > 0 ? (
              <div className="list-group">
                {share.shares.map(shareItem => (
                  <div key={shareItem._id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">
                          {shareItem.shareType === 'link' && 'Shareable Link'}
                          {shareItem.shareType === 'email' && 'Email Share'}
                          {shareItem.shareType === 'user' && 'User Share'}
                          {shareItem.shareType === 'group' && 'Group Share'}
                          {shareItem.shareType === 'public' && 'Public Share'}
                        </h6>
                        <small className="text-muted">
                          Created on {new Date(shareItem.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <div>
                        <span className={`badge ${shareItem.isActive ? 'badge-success' : 'badge-secondary'} mr-2`}>
                          {shareItem.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-primary mr-1"
                          onClick={() => handleSelectShare(shareItem)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary mr-1"
                          onClick={() => handleToggleShareStatus(shareItem._id)}
                        >
                          {shareItem.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteShare(shareItem._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {shareItem.shareType === 'link' && (
                      <div className="mt-2">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            value={`${window.location.origin}/shared/${shareItem.shareToken}`}
                            readOnly
                          />
                          <div className="input-group-append">
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() => handleCopyLink(shareItem.shareToken)}
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <small className="text-muted">
                        Views: {shareItem.statistics.views} | 
                        Unique Views: {shareItem.statistics.uniqueViews} | 
                        Downloads: {shareItem.statistics.downloads} | 
                        Comments: {shareItem.statistics.comments}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No shares created yet</p>
            )}
          </div>
          
          {selectedShare && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Edit Share</h5>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="shareType">Share Type</label>
                  <select
                    className="form-control"
                    id="shareType"
                    name="shareType"
                    value={shareType}
                    onChange={onChange}
                    disabled
                  >
                    <option value="link">Shareable Link</option>
                    <option value="email">Email</option>
                    <option value="user">Specific Users</option>
                    <option value="group">Group</option>
                    <option value="public">Public</option>
                  </select>
                </div>

                {(shareType === 'email' || shareType === 'user' || shareType === 'group') && (
                  <div className="form-group">
                    <label htmlFor="recipients">
                      {shareType === 'email' ? 'Email Addresses' : 
                       shareType === 'user' ? 'User IDs' : 'Group Names'}
                      <small className="form-text text-muted">
                        Separate multiple entries with commas
                      </small>
                    </label>
                    <textarea
                      className="form-control"
                      id="recipients"
                      name="recipients"
                      value={recipients}
                      onChange={onChange}
                      rows="3"
                    ></textarea>
                  </div>
                )}

                <div className="form-group">
                  <label>Permissions</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="canView"
                      name="permissions.canView"
                      checked={permissions.canView}
                      onChange={onChange}
                      disabled
                    />
                    <label className="form-check-label" htmlFor="canView">
                      Can View
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="canEdit"
                      name="permissions.canEdit"
                      checked={permissions.canEdit}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="canEdit">
                      Can Edit
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="canComment"
                      name="permissions.canComment"
                      checked={permissions.canComment}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="canComment">
                      Can Comment
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="canShare"
                      name="permissions.canShare"
                      checked={permissions.canShare}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="canShare">
                      Can Share
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="canDownload"
                      name="permissions.canDownload"
                      checked={permissions.canDownload}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="canDownload">
                      Can Download
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Settings</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="requireLogin"
                      name="settings.requireLogin"
                      checked={settings.requireLogin}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="requireLogin">
                      Require Login
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="allowComments"
                      name="settings.allowComments"
                      checked={settings.allowComments}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="allowComments">
                      Allow Comments
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="showAnalytics"
                      name="settings.showAnalytics"
                      checked={settings.showAnalytics}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="showAnalytics">
                      Show Analytics
                    </label>
                  </div>
                  <div className="form-group mt-2">
                    <label htmlFor="password">Password (optional)</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="settings.password"
                      value={settings.password}
                      onChange={onChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="expirationDate">Expiration Date (optional)</label>
                    <input
                      type="date"
                      className="form-control"
                      id="expirationDate"
                      name="settings.expirationDate"
                      value={settings.expirationDate}
                      onChange={onChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <button
                    type="button"
                    className="btn btn-primary mr-2"
                    onClick={handleUpdateShare}
                  >
                    Update Share
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedShare(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderComments = () => (
    <div className="share-comments">
      {selectedShare ? (
        <>
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Share Details</h5>
            </div>
            <div className="card-body">
              <p>
                <strong>Share Type:</strong> {selectedShare.shareType}
              </p>
              <p>
                <strong>Created:</strong> {new Date(selectedShare.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong> {selectedShare.isActive ? 'Active' : 'Inactive'}
              </p>
              {selectedShare.shareType === 'link' && (
                <div className="mb-3">
                  <label className="d-block">Share Link:</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={`${window.location.origin}/shared/${selectedShare.shareToken}`}
                      readOnly
                    />
                    <div className="input-group-append">
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => handleCopyLink(selectedShare.shareToken)}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="mb-3">
                <strong>Statistics:</strong>
                <ul className="list-unstyled">
                  <li>Views: {selectedShare.statistics.views}</li>
                  <li>Unique Views: {selectedShare.statistics.uniqueViews}</li>
                  <li>Downloads: {selectedShare.statistics.downloads}</li>
                  <li>Comments: {selectedShare.statistics.comments}</li>
                </ul>
              </div>
              {selectedShare.permissions.canDownload && (
                <button
                  className="btn btn-outline-primary"
                  onClick={handleDownload}
                >
                  Record Download
                </button>
              )}
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Comments</h5>
            </div>
            <div className="card-body">
              {selectedShare.comments && selectedShare.comments.length > 0 ? (
                <div className="comments-list">
                  {selectedShare.comments.map((comment, index) => (
                    <div key={index} className="comment mb-3">
                      <div className="d-flex justify-content-between">
                        <h6>{comment.user.firstName} {comment.user.lastName}</h6>
                        <small className="text-muted">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </small>
                      </div>
                      <p>{comment.text}</p>
                      
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="replies ml-4">
                          {comment.replies.map((reply, replyIndex) => (
                            <div key={replyIndex} className="reply mb-2">
                              <div className="d-flex justify-content-between">
                                <h6>{reply.user.firstName} {reply.user.lastName}</h6>
                                <small className="text-muted">
                                  {new Date(reply.timestamp).toLocaleDateString()}
                                </small>
                              </div>
                              <p>{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setReplyingTo(index)}
                      >
                        Reply
                      </button>
                      
                      {replyingTo === index && (
                        <div className="mt-2 ml-4">
                          <textarea
                            className="form-control mb-2"
                            rows="2"
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                          ></textarea>
                          <button
                            className="btn btn-sm btn-primary mr-2"
                            onClick={() => handleAddReply(index)}
                          >
                            Submit
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No comments yet</p>
              )}
              
              <div className="mt-4">
                <h6>Add a Comment</h6>
                <textarea
                  className="form-control mb-2"
                  rows="3"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                ></textarea>
                <button
                  className="btn btn-primary"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Submit Comment
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">Select a share to view comments</p>
        </div>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Content" size="lg">
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create Share
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Shares
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            Comments
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === 'create' && renderCreateShare()}
        {activeTab === 'manage' && renderManageShares()}
        {activeTab === 'comments' && renderComments()}
      </div>
    </Modal>
  );
};

ShareContent.propTypes = {
  auth: PropTypes.object.isRequired,
  share: PropTypes.object.isRequired,
  createShare: PropTypes.func.isRequired,
  getShares: PropTypes.func.isRequired,
  getShare: PropTypes.func.isRequired,
  updateShare: PropTypes.func.isRequired,
  deleteShare: PropTypes.func.isRequired,
  toggleShareStatus: PropTypes.func.isRequired,
  addComment: PropTypes.func.isRequired,
  addReply: PropTypes.func.isRequired,
  recordDownload: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
  content: PropTypes.object.isRequired,
  contentType: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  share: state.share
});

export default connect(mapStateToProps, {
  createShare,
  getShares,
  getShare,
  updateShare,
  deleteShare,
  toggleShareStatus,
  addComment,
  addReply,
  recordDownload,
  setAlert
})(withRouter(ShareContent));