"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search, UserX, UserCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
  dependencia: string | null
  is_active: boolean
  created_at: string
}

interface UsersTableProps {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  )

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/users/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error toggling user:", error)
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default"
      case "supervisor":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredUsers.length} usuario{filteredUsers.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Dependencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || "Sin nombre"}</TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{user.dependencia || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(user.id, user.is_active)}
                        title={user.is_active ? "Desactivar" : "Activar"}
                      >
                        {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <Link href={`/admin/usuarios/${user.id}/editar`}>
                        <Button variant="ghost" size="icon" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteUser(user.id)}
                        title="Eliminar"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
