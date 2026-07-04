<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

export interface UserRoleForm {
  email: string
  role_codes: string[]
}

interface UserOption {
  id_user: number
  email: string
  full_name: string
}

interface RoleOption {
  role_code: string
  name: string
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'detail'
  userRole?: any
}>()

const emit = defineEmits<{
  close: []
  save: [data: UserRoleForm]
}>()

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const users = ref<UserOption[]>([])
const roles = ref<RoleOption[]>([])

const form = ref<UserRoleForm>({
  email: '',
  role_codes: [],
})

async function fetchUsers() {
  try {
    const res = await fetch(`${apiUrl}/api/users`)
    if (!res.ok) throw new Error('Failed to fetch users')
    const json = await res.json()
    users.value = (json.data || []).map((u: any) => ({
      id_user: u.id_user,
      email: u.email,
      full_name: u.full_name,
    }))
  } catch (err) {
    console.error('Error fetching users:', err)
    users.value = []
  }
}

async function fetchRoles() {
  try {
    const res = await fetch(`${apiUrl}/api/roles`)
    if (!res.ok) throw new Error('Failed to fetch roles')
    const json = await res.json()
    roles.value = (json.data || []).map((r: any) => ({
      role_code: r.role_code,
      name: r.name,
    }))
  } catch (err) {
    console.error('Error fetching roles:', err)
    roles.value = []
  }
}

watch(() => props.visible, async (val) => {
  if (val) {
    await Promise.all([fetchUsers(), fetchRoles()])
    if (props.mode === 'add') {
      form.value = { email: '', role_codes: [] }
    } else if (props.userRole) {
      form.value = {
        email: props.userRole.email,
        role_codes: [props.userRole.role_code],
      }
      try {
        const res = await fetch(`${apiUrl}/api/user-roles/email/${props.userRole.email}`)
        if (res.ok) {
          const json = await res.json()
          if (json.data && Array.isArray(json.data)) {
            form.value.role_codes = json.data.map((ur: any) => ur.role_code)
          }
        }
      } catch (err) {
        console.error('Error fetching user roles:', err)
      }
    }
  }
})

function save() {
  if (!form.value.email || form.value.role_codes.length === 0) return
  emit('save', { ...form.value })
}
</script>

<template>
  <div v-if="visible" class="modal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" @click="emit('close')">&times;</button>
          <h4 class="modal-title">
            <template v-if="mode === 'add'">Assign Role</template>
            <template v-else-if="mode === 'edit'">Edit User Role</template>
            <template v-else>User Role Detail</template>
          </h4>
        </div>

        <div class="modal-body">
          <template v-if="mode === 'detail' && userRole">
            <div class="form">
              <div class="row">
                <div class="col-md-5">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Full Name</label>
                    <input class="form-control" :value="userRole.user?.full_name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Email Address</label>
                    <input class="form-control" :value="userRole.email" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Status</label>
                    <input class="form-control" :value="userRole.status" readonly style="text-transform: capitalize;" />
                  </div>
                </div>
                
                <div class="col-md-7">
                  <label class="control-label" style="font-weight: bold; display: block; text-align: left; margin-bottom: 8px;">Assigned Roles</label>
                  <div class="table-responsive">
                    <table class="table table-striped table-bordered" style="margin-bottom: 0;">
                      <thead>
                        <tr>
                          <th>Role Code</th>
                          <th>Role Name</th>
                          <th>Assigned Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="r in userRole.roles" :key="r.role_code">
                          <td><span class="label label-default" style="font-family: monospace; font-size: 13px;">{{ r.role_code }}</span></td>
                          <td>{{ r.role?.name || r.name || r.role_code }}</td>
                          <td>{{ new Date(r.date_created).toLocaleDateString() }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">
                      User <span class="text-danger">*</span>
                    </label>
                    <select v-model="form.email" class="form-control" :disabled="mode === 'edit'">
                      <option value="" disabled>Select user</option>
                      <option v-for="u in users" :key="u.email" :value="u.email">
                        {{ u.full_name }} ({{ u.email }})
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="row" style="margin-top: 12px;">
                <div class="col-md-12">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">
                      Roles <span class="text-danger">*</span>
                    </label>
                    <div class="well well-sm" style="max-height: 200px; overflow-y: auto; padding: 8px 12px;">
                      <div v-for="r in roles" :key="r.role_code" style="padding: 4px 0;">
                        <label style="font-weight: normal; cursor: pointer; margin: 0;">
                          <input type="checkbox" :value="r.role_code" v-model="form.role_codes" style="margin-right: 6px;" />
                          {{ r.name }} ({{ r.role_code }})
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-default" @click="emit('close')">Close</button>
          <button v-if="mode !== 'detail'" type="button" class="btn btn-primary" @click="save" :disabled="!form.email || form.role_codes.length === 0">
            Save changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
