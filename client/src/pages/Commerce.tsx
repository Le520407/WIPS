import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface CommerceSettings {
  is_cart_enabled: boolean;
  is_catalog_visible: boolean;
}

interface Order {
  id: number;
  order_id: string;
  customer_phone: string;
  customer_name?: string;
  items: any[];
  total_amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
}

export default function Commerce() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CommerceSettings>({
    is_cart_enabled: true,
    is_catalog_visible: false,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Phone Number ID from environment (803320889535856)
  const phoneNumberId = '803320889535856';

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [settingsRes, ordersRes, statsRes] = await Promise.all([
        api.get(`/commerce/settings?userId=${user.id}&phoneNumberId=${phoneNumberId}`).catch(() => null),
        api.get(`/orders?userId=${user.id}`),
        api.get(`/orders/stats?userId=${user.id}`),
      ]);

      if (settingsRes?.data.settings) {
        setSettings(settingsRes.data.settings);
      }
      setOrders(ordersRes.data.orders);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Failed to load commerce data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<CommerceSettings>) => {
    try {
      await api.put('/commerce/settings', {
        userId: user?.id,
        phoneNumberId,
        ...newSettings,
      });
      setSettings({ ...settings, ...newSettings });
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to update settings');
    }
  };

  const updateOrderStatus = async (orderId: number, status: string, notes?: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        userId: user?.id,
        status,
        notes,
      });
      loadData();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">E-commerce Management</h1>
        <p className="text-gray-600">Manage your WhatsApp commerce settings and orders</p>
      </div>

      {/* Commerce Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Commerce Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Shopping Cart</h3>
              <p className="text-sm text-gray-600">Enable cart buttons in product views</p>
            </div>
            <button
              onClick={() => updateSettings({ is_cart_enabled: !settings.is_cart_enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.is_cart_enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.is_cart_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Catalog Visibility</h3>
              <p className="text-sm text-gray-600">Show catalog storefront icon</p>
            </div>
            <button
              onClick={() => updateSettings({ is_catalog_visible: !settings.is_catalog_visible })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.is_catalog_visible ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.is_catalog_visible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Order Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Orders</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <div className="text-sm text-yellow-800">Pending</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <div className="text-sm text-blue-800">Processing</div>
            <div className="text-2xl font-bold text-blue-900">{stats.processing}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="text-sm text-green-800">Completed</div>
            <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4">
            <div className="text-sm text-red-800">Cancelled</div>
            <div className="text-2xl font-bold text-red-900">{stats.cancelled}</div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{order.order_id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{order.customer_name || 'Unknown'}</div>
                      <div className="text-gray-500">{order.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.items.length} item(s)
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.currency} {order.total_amount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Customer Information</h3>
                <div className="text-sm space-y-1">
                  <div>Name: {selectedOrder.customer_name || 'Unknown'}</div>
                  <div>Phone: {selectedOrder.customer_phone}</div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm border-b pb-2">
                      <div>
                        <div className="font-medium">{item.name || item.product_retailer_id}</div>
                        <div className="text-gray-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div>{item.currency} {item.item_price}</div>
                        <div className="text-gray-500">
                          Total: {item.currency} {(parseFloat(item.item_price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                  <div>Total:</div>
                  <div>{selectedOrder.currency} {selectedOrder.total_amount}</div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Update Status</h3>
                <div className="flex gap-2">
                  {['pending', 'processing', 'completed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder.id, status)}
                      disabled={selectedOrder.status === status}
                      className={`px-4 py-2 rounded text-sm font-medium ${
                        selectedOrder.status === status
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
