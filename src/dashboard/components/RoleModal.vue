<script setup lang="ts">
import { ref, watch } from 'vue'

export interface RoleForm {
  role_code: string
  name: string
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'detail'
  role: RoleForm & { id_role?: number; date_created?: string; date_modified?: string; user_created?: string | null; user_modified?: string | null; status?: string } | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: RoleForm]
}>()

const form = ref<RoleForm>({
  role_code: '',
  name: '',
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.mode === 'add') {
      form.value = { role_code: '', name: '' }
    } else if (props.role) {
      form.value = {
        role_code: props.role.role_code,
        name: props.role.name,
      }
    }
  }
})

function save() {
  if (!form.value.role_code || !form.value.name) return
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
            <template v-if="mode === 'add'">Add Role</template>
            <template v-else-if="mode === 'edit'">Edit Role</template>
            <template v-else>Role Detail</template>
          </h4>
        </div>

        <div class="modal-body">
          <template v-if="mode === 'detail' && role">
            <div class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Role Code</label>
                    <input class="form-control" :value="role.role_code" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Name</label>
                    <input class="form-control" :value="role.name" readonly />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Created</label>
                    <input class="form-control" :value="role.date_created ? new Date(role.date_created).toLocaleDateString() : '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Modified</label>
                    <input class="form-control" :value="role.date_modified ? new Date(role.date_modified).toLocaleDateString() : '-'" readonly />
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
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Role Code <span class="text-danger">*</span></label>
                    <input class="form-control" v-model="form.role_code" placeholder="e.g. admin, manager" :readonly="mode === 'edit'" />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Name <span class="text-danger">*</span></label>
                    <input class="form-control" v-model="form.name" placeholder="Role name" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-default" @click="emit('close')">Close</button>
          <button v-if="mode !== 'detail'" type="button" class="btn btn-primary" @click="save">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>
