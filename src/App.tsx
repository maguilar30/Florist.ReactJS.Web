import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { AdminLayout } from './pages/AdminLayout'
import { AccountPage } from './pages/AccountPage'
import { MyOrdersPage } from './pages/MyOrdersPage'
import { CartPage } from './pages/CartPage'
import { CategoriesAdminPage } from './pages/CategoriesAdminPage'
import { ContactInfoAdminPage } from './pages/ContactInfoAdminPage'
import { ContactMessagesAdminPage } from './pages/ContactMessagesAdminPage'
import { ContactPage } from './pages/ContactPage'
import { CreateOrderAdminPage } from './pages/CreateOrderAdminPage'
import { CustomersPage } from './pages/CustomersPage'
import { DeliveryFeesAdminPage } from './pages/DeliveryFeesAdminPage'
import { DiscountsAdminPage } from './pages/DiscountsAdminPage'
import { LoyaltyAdminPage } from './pages/LoyaltyAdminPage'
import { HomePage } from './pages/HomePage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { OrdersAdminPage } from './pages/OrdersAdminPage'
import { ProductsAdminPage } from './pages/ProductsAdminPage'
import { ProductsPage } from './pages/ProductsPage'
import { RegisterPage } from './pages/RegisterPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="productos" element={<ProductsPage />} />
              <Route path="productos/:id" element={<ProductDetailPage />} />
              <Route path="carrito" element={<CartPage />} />
              <Route path="contacto" element={<ContactPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="registro" element={<RegisterPage />} />
              <Route path="olvide-contrasena" element={<ForgotPasswordPage />} />
              <Route path="restablecer-contrasena" element={<ResetPasswordPage />} />
              <Route
                path="cuenta"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="mis-pedidos"
                element={
                  <ProtectedRoute>
                    <MyOrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="pedidos" replace />} />
                <Route path="pedidos" element={<OrdersAdminPage />} />
                <Route path="nuevo-pedido" element={<CreateOrderAdminPage />} />
                <Route path="productos" element={<ProductsAdminPage />} />
                <Route path="categorias" element={<CategoriesAdminPage />} />
                <Route path="clientes" element={<CustomersPage />} />
                <Route path="mensajes" element={<ContactMessagesAdminPage />} />
                <Route path="contacto" element={<ContactInfoAdminPage />} />
                <Route path="envio" element={<DeliveryFeesAdminPage />} />
                <Route path="descuentos" element={<DiscountsAdminPage />} />
                <Route path="fidelidad" element={<LoyaltyAdminPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
