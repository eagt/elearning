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
  recordDownload,
  clearShare
} from '../../actions/share';
import { setAlert } from '../../actions/alert';
import Modal from '../layout/Modal';
import Spinner from '../layout/Spinner';

const Share = ({
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
  clearShare,
  setAlert,
  content,
  contentType,
  history,
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: false,
    allowComments: true,
    allowDownload: false,
    requireLogin: false,
    password: '',
    expiresAt: '',
    settings: {
      showBranding: true,
      allowEmbed: false,
      allowShare: true,
      trackViews: true,
      trackDownloads: true
    }
  });

  const [activeTab, setActiveTab] = useState('create');
  const [selectedShare, setSelectedShare] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const {
    title,
    description,
    isPublic,
    allowComments,
    allowDownload,
    requireLogin,
    password,
    expiresAt,
    settings
  } = formData;

  useEffect(() => {
    if (isOpen && content) {
      getShares();
    }
  }, [isOpen, content, getShares]);

  useEffect(() => {
    if (selectedShare) {
      getShare(selectedShare._id);
    }
  }, [selectedShare, getShare]);

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
      setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    const shareData = {
      contentId: content._id,
      contentType,
      title: title || `${content.title} - Shared`,
      description,
      isPublic,
      allowComments,
      allowDownload,
      requireLogin,
      password,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      settings
    };

    try {
      const newShare = await createShare(shareData);
      setAlert('Content shared successfully', 'success');
      getShares();
      setSelectedShare(newShare);
      setShareLink(`${window.location.origin}/shared/${newShare.token}`);
      setActiveTab('manage');
    } catch (err) {
      setAlert('Error sharing content', 'danger');
    }
  };

  const handleUpdateShare = async () => {
    if (!selectedShare) return;
    
    const shareData = {
      title,
      description,
      isPublic,
      allowComments,
      allowDownload,
      requireLogin,
      password,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      settings
    };

    try {
      await updateShare(selectedShare._id, shareData);
      setAlert('Share updated successfully', 'success');
      getShare(selectedShare._id);
    } catch (err) {
      setAlert('Error updating share', 'danger');
    }
  };

  const handleDeleteShare = async shareId => {
    if (window.confirm('Are you sure you want to delete this share? This action cannot be undone.')) {
      try {
        await deleteShare(shareId);
        setAlert('Share deleted successfully', 'success');
        getShares();
        setSelectedShare(null);
        setShareLink('');
      } catch (err) {
        setAlert('Error deleting share', 'danger');
      }
    }
  };

  const handleToggleStatus = async shareId => {
    try {
      await toggleShareStatus(shareId);
      setAlert('Share status updated', 'success');
      getShare(shareId);
    } catch (err) {
      setAlert('Error updating share status', 'danger');
    }
  };

  const handleSelectShare = share => {
    setSelectedShare(share);
    setFormData({
      title: share.title || '',
      description: share.description || '',
      isPublic: share.isPublic || false,
      allowComments: share.allowComments || true,
      allowDownload: share.allowDownload || false,
      requireLogin: share.requireLogin || false,
      password: share.password || '',
      expiresAt: share.expiresAt ? new Date(share.expiresAt).toISOString().split('T')[0] : '',
      settings: share.settings || {
        showBranding: true,
        allowEmbed: false,
        allowShare: true,
        trackViews: true,
        trackDownloads: true
      }
    });
    setShareLink(`${window.location.origin}/shared/${share.token}`);
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderCreateShare = () => (
    <div className="share-create">
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="title">Share Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            placeholder={`${content.title} - Shared`}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            rows="3"
          ></textarea>
        </div>

        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={isPublic}
            onChange={onChange}
          />
          <label className="form-check-label" htmlFor="isPublic">
            Public Share
          </label>
        </div>

        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="allowComments"
            name="allowComments"
            checked={allowComments}
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
            id="allowDownload"
            name="allowDownload"
            checked={allowDownload}
            onChange={onChange}
          />
          <label className="form-check-label" htmlFor="allowDownload">
            Allow Download
          </label>
        </div>

        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="requireLogin"
            name="requireLogin"
            checked={requireLogin}
            onChange={onChange}
          />
          <label className="form-check-label" htmlFor="requireLogin">
            Require Login
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password (optional)</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="expiresAt">Expires At (optional)</label>
          <input
            type="date"
            className="form-control"
            id="expiresAt"
            name="expiresAt"
            value={expiresAt}
            onChange={onChange}
          />
        </div>

        <div className="form-group">
          <label>Share Settings</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="showBranding"
              name="settings.showBranding"
              checked={settings.showBranding}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="showBranding">
              Show Branding
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="allowEmbed"
              name="settings.allowEmbed"
              checked={settings.allowEmbed}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="allowEmbed">
              Allow Embed
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="allowShare"
              name="settings.allowShare"
              checked={settings.allowShare}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="allowShare">
              Allow Share
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="trackViews"
              name="settings.trackViews"
              checked={settings.trackViews}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="trackViews">
              Track Views
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="trackDownloads"
              name="settings.trackDownloads"
              checked={settings.trackDownloads}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="trackDownloads">
              Track Downloads
            </label>
          </div>
        </div>

        <div className="form-group">
          <button type="submit" className="btn btn-primary">
            Create Share
          </button>
        </div>
      </form>
    </div>
  );

  const renderManageShare = () => (
    <div className="share-manage">
      {share.loading ? (
        <Spinner />
      ) : (
        <>
          <div className="mb-4">
            <h5>Your Shares</h5>
            {share.shares && share.shares.length > 0 ? (
              <div className="list-group">
                {share.shares.map(shareItem => (
                  <div key={shareItem._id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{shareItem.title}</h6>
                        <small className="text-muted">
                          Created on {new Date(shareItem.createdAt).toLocaleDateString()} | 
                          Views: {shareItem.viewCount} | 
                          Downloads: {shareItem.downloadCount}
                        </small>
                        <div>
                          <span className={`badge ${shareItem.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {shareItem.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`badge ${shareItem.isPublic ? 'badge-info' : 'badge-warning'} ml-2`}>
                            {shareItem.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <button
                          className="btn btn-sm btn-outline-primary mr-2"
                          onClick={() => handleSelectShare(shareItem)}
                        >
                          Manage
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary mr-2"
                          onClick={() => handleToggleStatus(shareItem._id)}
                        >
                          {shareItem.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteShare(shareItem._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No shares found</p>
            )}
          </div>

          {selectedShare && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Manage Share</h5>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="title">Share Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={title}
                    onChange={onChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={description}
                    onChange={onChange}
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={isPublic}
                    onChange={onChange}
                  />
                  <label className="form-check-label" htmlFor="isPublic">
                    Public Share
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="allowComments"
                    name="allowComments"
                    checked={allowComments}
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
                    id="allowDownload"
                    name="allowDownload"
                    checked={allowDownload}
                    onChange={onChange}
                  />
                  <label className="form-check-label" htmlFor="allowDownload">
                    Allow Download
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="requireLogin"
                    name="requireLogin"
                    checked={requireLogin}
                    onChange={onChange}
                  />
                  <label className="form-check-label" htmlFor="requireLogin">
                    Require Login
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password (optional)</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="expiresAt">Expires At (optional)</label>
                  <input
                    type="date"
                    className="form-control"
                    id="expiresAt"
                    name="expiresAt"
                    value={expiresAt}
                    onChange={onChange}
                  />
                </div>

                <div className="form-group">
                  <label>Share Link</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={shareLink}
                      readOnly
                    />
                    <div className="input-group-append">
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={handleCopyLink}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpdateShare}
                  >
                    Update Share
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
              <h5 className="mb-0">Add Comment</h5>
            </div>
            <div className="card-body">
              <div className="form-group">
                <textarea
                  className="form-control"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  rows="3"
                  placeholder="Add a comment..."
                ></textarea>
              </div>
              <div className="form-group">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Comments</h5>
            </div>
            <div className="card-body">
              {share.share && share.share.comments && share.share.comments.length > 0 ? (
                <div className="comments-list">
                  {share.share.comments.map((comment, index) => (
                    <div key={index} className="comment mb-4">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6>{comment.userId.firstName} {comment.userId.lastName}</h6>
                          <small className="text-muted">
                            {new Date(comment.timestamp).toLocaleString()}
                          </small>
                        </div>
                        {comment.isResolved && (
                          <span className="badge badge-success">Resolved</span>
                        )}
                      </div>
                      <p className="mt-2">{comment.text}</p>
                      <div className="mt-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setReplyingTo(replyingTo === index ? null : index)}
                        >
                          {replyingTo === index ? 'Cancel' : 'Reply'}
                        </button>
                      </div>
                      
                      {replyingTo === index && (
                        <div className="mt-3 ml-4">
                          <textarea
                            className="form-control"
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            rows="2"
                            placeholder="Add a reply..."
                          ></textarea>
                          <div className="mt-2">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleAddReply(index)}
                              disabled={!replyText.trim()}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="replies mt-3 ml-4">
                          {comment.replies.map((reply, replyIndex) => (
                            <div key={replyIndex} className="reply mb-3">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <h6>{reply.userId.firstName} {reply.userId.lastName}</h6>
                                  <small className="text-muted">
                                    {new Date(reply.timestamp).toLocaleString()}
                                  </small>
                                </div>
                              </div>
                              <p className="mt-2">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No comments found</p>
              )}
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
            Create
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage
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
        {activeTab === 'manage' && renderManageShare()}
        {activeTab === 'comments' && renderComments()}
      </div>
    </Modal>
  );
};

Share.propTypes = {
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
  clearShare: PropTypes.func.isRequired,
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
  clearShare,
  setAlert
})(withRouter(Share));