export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      frozen_clients: {
        Row: {
          apellido: string
          created_at: string
          direccion_default: string | null
          email: string
          id: string
          nombre: string
          telefono: string | null
          user_id: string | null
        }
        Insert: {
          apellido: string
          created_at?: string
          direccion_default?: string | null
          email: string
          id?: string
          nombre: string
          telefono?: string | null
          user_id?: string | null
        }
        Update: {
          apellido?: string
          created_at?: string
          direccion_default?: string | null
          email?: string
          id?: string
          nombre?: string
          telefono?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      frozen_config: {
        Row: {
          clave: string
          id: string
          valor: string
        }
        Insert: {
          clave: string
          id?: string
          valor: string
        }
        Update: {
          clave?: string
          id?: string
          valor?: string
        }
        Relationships: []
      }
      frozen_menu_items: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          orden: number
          precio: number
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          orden?: number
          precio?: number
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          orden?: number
          precio?: number
        }
        Relationships: []
      }
      frozen_order_items: {
        Row: {
          cantidad: number
          id: string
          menu_item_id: string
          order_id: string
          precio_unitario: number
        }
        Insert: {
          cantidad?: number
          id?: string
          menu_item_id: string
          order_id: string
          precio_unitario: number
        }
        Update: {
          cantidad?: number
          id?: string
          menu_item_id?: string
          order_id?: string
          precio_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "frozen_order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "frozen_menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "frozen_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "frozen_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      frozen_orders: {
        Row: {
          client_id: string
          comentarios: string | null
          created_at: string
          direccion_envio: string | null
          estado: string
          fecha_estimada: string | null
          fecha_pedido: string
          id: string
          metodo_pago: string
          necesita_envio: boolean
          total: number
        }
        Insert: {
          client_id: string
          comentarios?: string | null
          created_at?: string
          direccion_envio?: string | null
          estado?: string
          fecha_estimada?: string | null
          fecha_pedido?: string
          id?: string
          metodo_pago?: string
          necesita_envio?: boolean
          total?: number
        }
        Update: {
          client_id?: string
          comentarios?: string | null
          created_at?: string
          direccion_envio?: string | null
          estado?: string
          fecha_estimada?: string | null
          fecha_pedido?: string
          id?: string
          metodo_pago?: string
          necesita_envio?: boolean
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "frozen_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "frozen_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      frozen_user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["frozen_user_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["frozen_user_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["frozen_user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_frozen_role: {
        Args: {
          _role: Database["public"]["Enums"]["frozen_user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      frozen_user_role: "superadmin" | "admin_adjunto" | "cliente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      frozen_user_role: ["superadmin", "admin_adjunto", "cliente"],
    },
  },
} as const
