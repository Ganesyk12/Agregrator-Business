<script setup lang="ts">
import { ref, watch } from 'vue'

export interface CategoryForm {
  category_name: string
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'detail'
  category: CategoryForm & { id_category?: number; date_created?: string; date_modified?: string; user_created?: string | null; user_modified?: string | null; status?: string } | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: CategoryForm]
}>()

const form = ref<CategoryForm>({
  category_name: '',
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.mode === 'add') {
      form.value = { category_name: '' }
    } else if (props.category) {
      form.value = {
        category_name: props.category.category_name,
      }
    }
  }
})

function save() {
  if (!form.value.category_name) return
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
            <template v-if="mode === 'add'">Add Category</template>
            <template v-else-if="mode === 'edit'">Edit Category</template>
            <template v-else>Category Detail</template>
          </h4>
        </div>

        <div class="modal-body">
          <!-- DETAIL VIEW -->
          <template v-if="mode === 'detail' && category">
            <div class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Category Name</label>
                    <input class="form-control" :value="category.category_name" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Status</label>
                    <input class="form-control" :value="category.status" readonly />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Created</label>
                    <input class="form-control" :value="category.date_created ? new Date(category.date_created).toLocaleDateString() : '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Modified</label>
                    <input class="form-control" :value="category.date_modified ? new Date(category.date_modified).toLocaleDateString() : '-'" readonly />
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ADD/EDIT FORM VIEW -->
          <template v-else>
            <div class="form">
              <div class="row">
                <div class="col-md-12">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Category Name <span class="text-danger">*</span></label>
                    <input class="form-control" v-model="form.category_name" placeholder="Category name (e.g. Wedding Planner, Photography)" required />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-default" @click="emit('close')">Close</button>
          <button v-if="mode !== 'detail'" type="button" class="btn btn-primary" @click="save" :disabled="!form.category_name">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>
