// Ginabo e-commerce — Supabase Database Types
// Auto-maintained: update when schema changes in Supabase

// ─── Enums ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'refunded'
  | 'challenge'

export type ResellerTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type NotificationChannel = 'email' | 'whatsapp' | 'push' | 'in_app'

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read'

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping'

// ─── Table Row Types ──────────────────────────────────────────────────────────

export interface ProfileRow {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  skin_type: string | null
  skin_concern: string[] | null
  date_of_birth: string | null
  gender: 'male' | 'female' | 'other' | null
  is_reseller: boolean
  reseller_id: string | null
  created_at: string
  updated_at: string
}

export interface CategoryRow {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductRow {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  category_id: string | null
  base_price: number
  sale_price: number | null
  sku: string | null
  stock: number
  weight_grams: number | null
  is_active: boolean
  is_featured: boolean
  ingredients: string | null
  how_to_use: string | null
  bpom_number: string | null
  tags: string[] | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export interface ProductVariantRow {
  id: string
  product_id: string
  name: string
  sku: string | null
  price_modifier: number
  stock: number
  attributes: Record<string, string>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductImageRow {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  position: number
  is_primary: boolean
  created_at: string
}

export interface AddressRow {
  id: string
  user_id: string
  label: string | null
  recipient_name: string
  phone: string
  address_line1: string
  address_line2: string | null
  city: string
  province: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface OrderRow {
  id: string
  order_number: string
  user_id: string
  status: OrderStatus
  subtotal: number
  shipping_cost: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  coupon_id: string | null
  shipping_address_id: string | null
  shipping_provider: string | null
  tracking_number: string | null
  notes: string | null
  reseller_id: string | null
  reseller_commission: number | null
  created_at: string
  updated_at: string
}

export interface OrderItemRow {
  id: string
  order_id: string
  product_id: string
  variant_id: string | null
  product_name: string
  variant_name: string | null
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface PaymentRow {
  id: string
  order_id: string
  midtrans_order_id: string | null
  midtrans_transaction_id: string | null
  payment_type: string | null
  status: PaymentStatus
  gross_amount: number
  snap_token: string | null
  snap_redirect_url: string | null
  fraud_status: string | null
  settlement_time: string | null
  expiry_time: string | null
  raw_response: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface BookingRow {
  id: string
  booking_number: string
  user_id: string
  slot_id: string
  service_name: string
  therapist_name: string | null
  status: BookingStatus
  notes: string | null
  price: number
  payment_id: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
}

export interface BookingSlotRow {
  id: string
  date: string
  start_time: string
  end_time: string
  service_type: string
  therapist_id: string | null
  max_capacity: number
  booked_count: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface ResellerRow {
  id: string
  user_id: string
  tier: ResellerTier
  referral_code: string
  total_sales: number
  total_commission: number
  pending_commission: number
  is_active: boolean
  joined_at: string
  updated_at: string
}

export interface ResellerTierRow {
  id: string
  tier: ResellerTier
  name: string
  min_sales: number
  commission_rate: number
  discount_rate: number
  benefits: string[] | null
  created_at: string
  updated_at: string
}

export interface ChallengeRegistrationRow {
  id: string
  user_id: string
  challenge_name: string
  started_at: string
  completed_at: string | null
  day_count: number
  is_completed: boolean
  progress_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface FlashSaleRow {
  id: string
  name: string
  starts_at: string
  ends_at: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FlashSaleItemRow {
  id: string
  flash_sale_id: string
  product_id: string
  variant_id: string | null
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  max_quantity: number | null
  sold_count: number
  created_at: string
}

export interface BundleRow {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  original_price: number
  bundle_price: number
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}

export interface BundleItemRow {
  id: string
  bundle_id: string
  product_id: string
  variant_id: string | null
  quantity: number
  created_at: string
}

export interface NotificationRow {
  id: string
  user_id: string
  channel: NotificationChannel
  status: NotificationStatus
  title: string
  body: string
  metadata: Record<string, unknown> | null
  sent_at: string | null
  read_at: string | null
  created_at: string
}

export interface AdminUserRow {
  id: string
  user_id: string
  email: string
  full_name: string | null
  role: 'super_admin' | 'admin' | 'staff' | 'cs'
  permissions: string[] | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface ReviewRow {
  id: string
  product_id: string
  user_id: string
  order_item_id: string | null
  rating: number
  title: string | null
  body: string | null
  images: string[] | null
  status: ReviewStatus
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
  updated_at: string
}

export interface CouponRow {
  id: string
  code: string
  type: CouponType
  value: number
  min_purchase: number | null
  max_discount: number | null
  usage_limit: number | null
  usage_count: number
  is_active: boolean
  starts_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface CouponUsageRow {
  id: string
  coupon_id: string
  user_id: string
  order_id: string
  discount_applied: number
  used_at: string
}

// ─── Insert / Update helpers ──────────────────────────────────────────────────

export type ProfileInsert = Omit<ProfileRow, 'created_at' | 'updated_at'>
export type ProfileUpdate = Partial<ProfileInsert>

export type CategoryInsert = Omit<CategoryRow, 'id' | 'created_at' | 'updated_at'>
export type CategoryUpdate = Partial<CategoryInsert>

export type ProductInsert = Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>
export type ProductUpdate = Partial<ProductInsert>

export type ProductVariantInsert = Omit<ProductVariantRow, 'id' | 'created_at' | 'updated_at'>
export type ProductVariantUpdate = Partial<ProductVariantInsert>

export type ProductImageInsert = Omit<ProductImageRow, 'id' | 'created_at'>
export type ProductImageUpdate = Partial<ProductImageInsert>

export type AddressInsert = Omit<AddressRow, 'id' | 'created_at' | 'updated_at'>
export type AddressUpdate = Partial<AddressInsert>

export type OrderInsert = Omit<OrderRow, 'id' | 'order_number' | 'created_at' | 'updated_at'>
export type OrderUpdate = Partial<OrderInsert>

export type OrderItemInsert = Omit<OrderItemRow, 'id' | 'created_at'>
export type OrderItemUpdate = Partial<OrderItemInsert>

export type PaymentInsert = Omit<PaymentRow, 'id' | 'created_at' | 'updated_at'>
export type PaymentUpdate = Partial<PaymentInsert>

export type BookingInsert = Omit<BookingRow, 'id' | 'booking_number' | 'created_at' | 'updated_at'>
export type BookingUpdate = Partial<BookingInsert>

export type BookingSlotInsert = Omit<BookingSlotRow, 'id' | 'created_at' | 'updated_at'>
export type BookingSlotUpdate = Partial<BookingSlotInsert>

export type ResellerInsert = Omit<ResellerRow, 'id' | 'joined_at' | 'updated_at'>
export type ResellerUpdate = Partial<ResellerInsert>

export type ResellerTierInsert = Omit<ResellerTierRow, 'id' | 'created_at' | 'updated_at'>
export type ResellerTierUpdate = Partial<ResellerTierInsert>

export type ChallengeRegistrationInsert = Omit<ChallengeRegistrationRow, 'id' | 'created_at' | 'updated_at'>
export type ChallengeRegistrationUpdate = Partial<ChallengeRegistrationInsert>

export type FlashSaleInsert = Omit<FlashSaleRow, 'id' | 'created_at' | 'updated_at'>
export type FlashSaleUpdate = Partial<FlashSaleInsert>

export type FlashSaleItemInsert = Omit<FlashSaleItemRow, 'id' | 'created_at'>
export type FlashSaleItemUpdate = Partial<FlashSaleItemInsert>

export type BundleInsert = Omit<BundleRow, 'id' | 'created_at' | 'updated_at'>
export type BundleUpdate = Partial<BundleInsert>

export type BundleItemInsert = Omit<BundleItemRow, 'id' | 'created_at'>
export type BundleItemUpdate = Partial<BundleItemInsert>

export type NotificationInsert = Omit<NotificationRow, 'id' | 'created_at'>
export type NotificationUpdate = Partial<NotificationInsert>

export type AdminUserInsert = Omit<AdminUserRow, 'id' | 'created_at' | 'updated_at'>
export type AdminUserUpdate = Partial<AdminUserInsert>

export type ReviewInsert = Omit<ReviewRow, 'id' | 'created_at' | 'updated_at'>
export type ReviewUpdate = Partial<ReviewInsert>

export type CouponInsert = Omit<CouponRow, 'id' | 'created_at' | 'updated_at'>
export type CouponUpdate = Partial<CouponInsert>

export type CouponUsageInsert = Omit<CouponUsageRow, 'id'>
export type CouponUsageUpdate = Partial<CouponUsageInsert>

// ─── Supabase Database type (compatible with createClient<Database>) ──────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      categories: {
        Row: CategoryRow
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
      products: {
        Row: ProductRow
        Insert: ProductInsert
        Update: ProductUpdate
      }
      product_variants: {
        Row: ProductVariantRow
        Insert: ProductVariantInsert
        Update: ProductVariantUpdate
      }
      product_images: {
        Row: ProductImageRow
        Insert: ProductImageInsert
        Update: ProductImageUpdate
      }
      addresses: {
        Row: AddressRow
        Insert: AddressInsert
        Update: AddressUpdate
      }
      orders: {
        Row: OrderRow
        Insert: OrderInsert
        Update: OrderUpdate
      }
      order_items: {
        Row: OrderItemRow
        Insert: OrderItemInsert
        Update: OrderItemUpdate
      }
      payments: {
        Row: PaymentRow
        Insert: PaymentInsert
        Update: PaymentUpdate
      }
      bookings: {
        Row: BookingRow
        Insert: BookingInsert
        Update: BookingUpdate
      }
      booking_slots: {
        Row: BookingSlotRow
        Insert: BookingSlotInsert
        Update: BookingSlotUpdate
      }
      resellers: {
        Row: ResellerRow
        Insert: ResellerInsert
        Update: ResellerUpdate
      }
      reseller_tiers: {
        Row: ResellerTierRow
        Insert: ResellerTierInsert
        Update: ResellerTierUpdate
      }
      challenge_registrations: {
        Row: ChallengeRegistrationRow
        Insert: ChallengeRegistrationInsert
        Update: ChallengeRegistrationUpdate
      }
      flash_sales: {
        Row: FlashSaleRow
        Insert: FlashSaleInsert
        Update: FlashSaleUpdate
      }
      flash_sale_items: {
        Row: FlashSaleItemRow
        Insert: FlashSaleItemInsert
        Update: FlashSaleItemUpdate
      }
      bundles: {
        Row: BundleRow
        Insert: BundleInsert
        Update: BundleUpdate
      }
      bundle_items: {
        Row: BundleItemRow
        Insert: BundleItemInsert
        Update: BundleItemUpdate
      }
      notifications: {
        Row: NotificationRow
        Insert: NotificationInsert
        Update: NotificationUpdate
      }
      admin_users: {
        Row: AdminUserRow
        Insert: AdminUserInsert
        Update: AdminUserUpdate
      }
      reviews: {
        Row: ReviewRow
        Insert: ReviewInsert
        Update: ReviewUpdate
      }
      coupons: {
        Row: CouponRow
        Insert: CouponInsert
        Update: CouponUpdate
      }
      coupon_usages: {
        Row: CouponUsageRow
        Insert: CouponUsageInsert
        Update: CouponUsageUpdate
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      order_status: OrderStatus
      payment_status: PaymentStatus
      reseller_tier: ResellerTier
      booking_status: BookingStatus
      notification_channel: NotificationChannel
    }
  }
}
