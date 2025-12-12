import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Add as AddIcon,
  Send as SendIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface MarketingTemplate {
  id: number;
  template_id: string;
  name: string;
  language: string;
  status: string;
  body_text: string;
  button_text?: string;
  button_url?: string;
  ad_id?: string;
}

interface MarketingCampaign {
  id: number;
  name: string;
  template_name: string;
  status: string;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  clicked_count: number;
  conversion_count: number;
  total_spend: number;
  created_at: string;
  insights?: any;
}

interface Contact {
  id: number;
  name: string;
  phone_number: string;
}

const MarketingCampaigns: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState<MarketingTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Template Dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    language: 'en_US',
    headerText: '',
    headerImageUrl: '',
    bodyText: '',
    footerText: '',
    buttonText: '',
    buttonUrl: '',
    ttl: 86400, // 24 hours
  });

  // Campaign Dialog
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    templateId: '',
    selectedContacts: [] as number[],
  });

  // Insights Dialog
  const [insightsDialogOpen, setInsightsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);

  useEffect(() => {
    loadTemplates();
    loadCampaigns();
    loadContacts();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await api.get('/marketing/templates');
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      const response = await api.get('/marketing/campaigns/with-insights');
      setCampaigns(response.data.campaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await api.get('/contacts');
      setContacts(response.data.contacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setLoading(true);
      await api.post('/marketing/templates', templateForm);
      setTemplateDialogOpen(false);
      setTemplateForm({
        name: '',
        language: 'en_US',
        headerText: '',
        headerImageUrl: '',
        bodyText: '',
        footerText: '',
        buttonText: '',
        buttonUrl: '',
        ttl: 86400,
      });
      loadTemplates();
    } catch (error: any) {
      console.error('Error creating template:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAdIds = async (templateId: string) => {
    try {
      setLoading(true);
      await api.post(`/marketing/templates/${templateId}/sync-ad-ids`);
      loadTemplates();
      alert('Ad IDs synced successfully! Wait 10 minutes before sending messages.');
    } catch (error: any) {
      console.error('Error syncing Ad IDs:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      setLoading(true);
      await api.post('/marketing/campaigns', {
        name: campaignForm.name,
        templateId: campaignForm.templateId,
        targetAudience: {
          contacts: campaignForm.selectedContacts,
        },
      });
      setCampaignDialogOpen(false);
      setCampaignForm({
        name: '',
        templateId: '',
        selectedContacts: [],
      });
      loadCampaigns();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (campaignId: number) => {
    if (!confirm('Are you sure you want to send this campaign?')) return;

    try {
      setLoading(true);
      const response = await api.post(`/marketing/campaigns/${campaignId}/send`);
      alert(`Campaign sent! ${response.data.summary.sent} messages sent successfully.`);
      loadCampaigns();
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleViewInsights = (campaign: MarketingCampaign) => {
    setSelectedCampaign(campaign);
    setInsightsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'sending':
        return 'info';
      case 'draft':
        return 'default';
      case 'scheduled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const calculateMetrics = (campaign: MarketingCampaign) => {
    const deliveryRate = campaign.sent_count > 0
      ? ((campaign.delivered_count / campaign.sent_count) * 100).toFixed(1)
      : '0';
    const readRate = campaign.delivered_count > 0
      ? ((campaign.read_count / campaign.delivered_count) * 100).toFixed(1)
      : '0';
    const clickRate = campaign.delivered_count > 0
      ? ((campaign.clicked_count / campaign.delivered_count) * 100).toFixed(1)
      : '0';
    const conversionRate = campaign.clicked_count > 0
      ? ((campaign.conversion_count / campaign.clicked_count) * 100).toFixed(1)
      : '0';

    return { deliveryRate, readRate, clickRate, conversionRate };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          <CampaignIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Marketing Campaigns
        </Typography>
      </Box>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Campaigns" />
        <Tab label="Templates" />
      </Tabs>

      {activeTab === 0 && (
        <>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCampaignDialogOpen(true)}
            >
              Create Campaign
            </Button>
          </Box>

          {campaigns.length === 0 ? (
            <Alert severity="info">
              No campaigns yet. Create your first marketing campaign!
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Campaign Name</TableCell>
                    <TableCell>Template</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Sent</TableCell>
                    <TableCell align="right">Delivered</TableCell>
                    <TableCell align="right">Read</TableCell>
                    <TableCell align="right">Clicked</TableCell>
                    <TableCell align="right">Conversions</TableCell>
                    <TableCell align="right">Spend</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>{campaign.name}</TableCell>
                      <TableCell>{campaign.template_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={campaign.status}
                          color={getStatusColor(campaign.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{campaign.sent_count}</TableCell>
                      <TableCell align="right">{campaign.delivered_count}</TableCell>
                      <TableCell align="right">{campaign.read_count}</TableCell>
                      <TableCell align="right">{campaign.clicked_count}</TableCell>
                      <TableCell align="right">{campaign.conversion_count}</TableCell>
                      <TableCell align="right">${campaign.total_spend}</TableCell>
                      <TableCell>
                        {campaign.status === 'draft' && (
                          <Button
                            size="small"
                            startIcon={<SendIcon />}
                            onClick={() => handleSendCampaign(campaign.id)}
                            disabled={loading}
                          >
                            Send
                          </Button>
                        )}
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewInsights(campaign)}
                        >
                          Insights
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {activeTab === 1 && (
        <>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setTemplateDialogOpen(true)}
            >
              Create Template
            </Button>
          </Box>

          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} md={6} key={template.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>
                    <Chip
                      label={template.status}
                      color={template.status === 'APPROVED' ? 'success' : 'warning'}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.body_text}
                    </Typography>
                    {template.button_text && (
                      <Chip label={template.button_text} size="small" sx={{ mb: 2 }} />
                    )}
                    <Box sx={{ mt: 2 }}>
                      {!template.ad_id ? (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleSyncAdIds(template.template_id)}
                          disabled={loading}
                        >
                          Sync Ad IDs
                        </Button>
                      ) : (
                        <Chip label="Ad IDs Synced" color="success" size="small" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Create Template Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Marketing Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={templateForm.language}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, language: e.target.value })
                  }
                >
                  <MenuItem value="en_US">English (US)</MenuItem>
                  <MenuItem value="zh_CN">Chinese (Simplified)</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Header Text (optional)"
                value={templateForm.headerText}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, headerText: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Header Image URL (optional)"
                value={templateForm.headerImageUrl}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, headerImageUrl: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Body Text"
                value={templateForm.bodyText}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, bodyText: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Footer Text (optional)"
                value={templateForm.footerText}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, footerText: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Button Text"
                value={templateForm.buttonText}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, buttonText: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Button URL"
                value={templateForm.buttonUrl}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, buttonUrl: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="TTL (seconds)"
                value={templateForm.ttl}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, ttl: parseInt(e.target.value) })
                }
                helperText="Time-to-live: 43200 (12h) to 2592000 (30d)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTemplate}
            variant="contained"
            disabled={loading || !templateForm.name || !templateForm.bodyText}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog
        open={campaignDialogOpen}
        onClose={() => setCampaignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Campaign</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Name"
                value={campaignForm.name}
                onChange={(e) =>
                  setCampaignForm({ ...campaignForm, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Template</InputLabel>
                <Select
                  value={campaignForm.templateId}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, templateId: e.target.value })
                  }
                >
                  {templates
                    .filter((t) => t.status === 'APPROVED' && t.ad_id)
                    .map((template) => (
                      <MenuItem key={template.id} value={template.template_id}>
                        {template.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Target Contacts</InputLabel>
                <Select
                  multiple
                  value={campaignForm.selectedContacts}
                  onChange={(e) =>
                    setCampaignForm({
                      ...campaignForm,
                      selectedContacts: e.target.value as number[],
                    })
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map((value) => {
                        const contact = contacts.find((c) => c.id === value);
                        return (
                          <Chip
                            key={value}
                            label={contact?.name || contact?.phone_number}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {contacts.map((contact) => (
                    <MenuItem key={contact.id} value={contact.id}>
                      {contact.name} ({contact.phone_number})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCampaignDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateCampaign}
            variant="contained"
            disabled={
              loading ||
              !campaignForm.name ||
              !campaignForm.templateId ||
              campaignForm.selectedContacts.length === 0
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Insights Dialog */}
      <Dialog
        open={insightsDialogOpen}
        onClose={() => setInsightsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Campaign Insights: {selectedCampaign?.name}</DialogTitle>
        <DialogContent>
          {selectedCampaign && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Sent
                    </Typography>
                    <Typography variant="h4">{selectedCampaign.sent_count}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Delivered
                    </Typography>
                    <Typography variant="h4">
                      {selectedCampaign.delivered_count}
                    </Typography>
                    <Typography variant="caption">
                      {calculateMetrics(selectedCampaign).deliveryRate}% rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Read
                    </Typography>
                    <Typography variant="h4">{selectedCampaign.read_count}</Typography>
                    <Typography variant="caption">
                      {calculateMetrics(selectedCampaign).readRate}% rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Clicked
                    </Typography>
                    <Typography variant="h4">{selectedCampaign.clicked_count}</Typography>
                    <Typography variant="caption">
                      {calculateMetrics(selectedCampaign).clickRate}% rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Conversions
                    </Typography>
                    <Typography variant="h4">
                      {selectedCampaign.conversion_count}
                    </Typography>
                    <Typography variant="caption">
                      {calculateMetrics(selectedCampaign).conversionRate}% rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Spend
                    </Typography>
                    <Typography variant="h4">${selectedCampaign.total_spend}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              {selectedCampaign.insights && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="subtitle2" gutterBottom>
                      Meta Insights Available
                    </Typography>
                    <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                      {JSON.stringify(selectedCampaign.insights, null, 2)}
                    </pre>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInsightsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {loading && <LinearProgress sx={{ mt: 2 }} />}
    </Box>
  );
};

export default MarketingCampaigns;
