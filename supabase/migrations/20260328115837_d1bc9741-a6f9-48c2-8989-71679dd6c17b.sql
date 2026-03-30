
-- Roles enum and table
CREATE TYPE public.frozen_user_role AS ENUM ('superadmin', 'admin_adjunto', 'cliente');

CREATE TABLE public.frozen_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role frozen_user_role NOT NULL DEFAULT 'cliente',
  UNIQUE(user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_frozen_role(_user_id UUID, _role frozen_user_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.frozen_user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Frozen clients
CREATE TABLE public.frozen_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  direccion_default TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Menu items
CREATE TABLE public.frozen_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC NOT NULL DEFAULT 12000,
  activo BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE public.frozen_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.frozen_clients(id) ON DELETE CASCADE,
  total NUMERIC NOT NULL DEFAULT 0,
  metodo_pago TEXT NOT NULL DEFAULT 'efectivo',
  necesita_envio BOOLEAN NOT NULL DEFAULT false,
  direccion_envio TEXT,
  comentarios TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  fecha_pedido TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_estimada TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items
CREATE TABLE public.frozen_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.frozen_orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.frozen_menu_items(id),
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario NUMERIC NOT NULL
);

-- Config
CREATE TABLE public.frozen_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL
);

-- Disable RLS as requested
ALTER TABLE public.frozen_user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.frozen_clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.frozen_menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.frozen_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.frozen_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.frozen_config DISABLE ROW LEVEL SECURITY;

-- Seed menu items
INSERT INTO public.frozen_menu_items (nombre, descripcion, precio, activo, orden) VALUES
('Albóndigas caseras con salsa de tomate y arroz yamani', 'Albóndigas caseras acompañadas de salsa de tomate casera y arroz yamani', 12000, true, 1),
('Bife magro grillado con puré rústico de calabaza y zanahoria', 'Bife magro grillado con puré rústico de calabaza y zanahoria', 12000, true, 2),
('Bondiola braseada con batata asada y coliflor', 'Bondiola braseada con batata asada y coliflor', 12000, true, 3),
('Chop suey de pollo', 'Chop suey de pollo con verduras salteadas', 12000, true, 4),
('Lentejas guisadas con vegetales y carne', 'Lentejas guisadas con vegetales y carne', 12000, true, 5),
('Merluza al horno con vegetales asados', 'Merluza al horno con vegetales asados', 12000, true, 6),
('Pollo al horno al limón con vegetales', 'Pollo al horno al limón con vegetales de estación', 12000, true, 7),
('Roll integral de pollo, mix de vegetales y mozzarella', 'Roll integral relleno de pollo, mix de vegetales y mozzarella', 12000, true, 8),
('Tarta integral de acelga, mozzarella y huevo', 'Tarta integral de acelga, mozzarella y huevo', 12000, true, 9),
('Tarta integral de pollo, muzza y huevo', 'Tarta integral de pollo, muzza y huevo', 12000, true, 10);

-- Seed config
INSERT INTO public.frozen_config (clave, valor) VALUES
('datos_bancarios', 'CBU: 0000000000000000000000
Alias: MUNDO.PRANA
Titular: Pilar - Mundo Prana'),
('precio_base', '12000');

-- Trigger to auto-create client profile on signup
CREATE OR REPLACE FUNCTION public.handle_frozen_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.frozen_clients (user_id, nombre, apellido, email, telefono)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'telefono', '')
  );
  INSERT INTO public.frozen_user_roles (user_id, role) VALUES (NEW.id, 'cliente');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_frozen_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_frozen_new_user();
