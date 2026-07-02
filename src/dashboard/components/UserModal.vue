<script setup lang="ts">
import { ref, watch } from 'vue'

export interface UserForm {
  email: string
  password?: string
  full_name: string
  phone: string
  role_code: string
  status: string
  is_active: boolean
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'detail'
  user?: any
}>()

const emit = defineEmits<{
  close: []
  save: [data: UserForm]
}>()

const statuses = ['active', 'inactive']

const form = ref<UserForm>({
  email: '',
  password: '',
  full_name: '',
  phone: '',
  role_code: 'customer',
  status: 'active',
  is_active: true,
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.mode === 'add') {
      form.value = {
        email: '',
        password: '',
        full_name: '',
        phone: '',
        role_code: 'customer',
        status: 'active',
        is_active: true,
      }
    } else if (props.user) {
      form.value = {
        email: props.user.email,
        password: '',
        full_name: props.user.full_name,
        phone: props.user.phone || '',
        role_code: props.user.role_code,
        status: props.user.status,
        is_active: props.user.is_active,
      }
    }
  }
})

function save() {
  if (!form.value.email || !form.value.full_name) return
  // Map status matching is_active boolean
  form.value.is_active = form.value.status === 'active'
  emit('save', { ...form.value })
}
</script>

<template>
  <div v-if="visible" class="modal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" @click="emit('close')">&times;</button>
          <h4 class="modal-title">
            <template v-if="mode === 'add'">Add User</template>
            <template v-else-if="mode === 'edit'">Edit User</template>
            <template v-else>User Detail</template>
          </h4>
        </div>

        <div class="modal-body">
          <!-- DETAIL VIEW -->
          <template v-if="mode === 'detail' && user">
            <div class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Full Name</label>
                    <input class="form-control" :value="user.full_name" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Email</label>
                    <input class="form-control" :value="user.email" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Phone</label>
                    <input class="form-control" :value="user.phone || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Role</label>
                    <input class="form-control" :value="user.role?.name || user.role_code" readonly />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Status</label>
                    <input class="form-control" :value="user.status" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Modified By</label>
                    <input class="form-control" :value="user.user_modified || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Created</label>
                    <input class="form-control" :value="user.date_created ? new Date(user.date_created).toLocaleDateString() : '-'" readonly />
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ADD/EDIT FORM VIEW -->
          <template v-else>
            <form @submit.prevent="save" class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Full Name *</label>
                    <input v-model="form.full_name" class="form-control" placeholder="Full name" required />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Email *</label>
                    <input v-model="form.email" type="email" class="form-control" placeholder="Email address" required />
                  </div>
                  <div class="form-group" style="text-align: left;" v-if="mode === 'add'">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Password</label>
                    <input v-model="form.password" type="password" class="form-control" placeholder="Defaults to 123456" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Phone</label>
                    <input v-model="form.phone" class="form-control" placeholder="Phone number" />
                  </div>
                </div>
                <div class="col-md-6">

                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Status</label>
                    <select v-model="form.status" class="form-control">
                      <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </template>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-default" @click="emit('close')">Close</button>
          <button v-if="mode !== 'detail'" type="button" class="btn btn-primary" @click="save" :disabled="!form.email || !form.full_name">
            Save changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
