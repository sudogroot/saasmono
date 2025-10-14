'use client'

import {
  Badge,
  Button,
  Card,
  Field,
  FieldError,
  FieldLabel,
  Input,
  SearchSelect,
  Separator,
  Textarea,
} from '@repo/ui'
import { Briefcase, Gavel, Loader2, Plus, Save, Tag, User, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { FileDocument, FileTag, LinkedEntity, LinkableEntityType } from './types'
import { mockTags } from './mocks/files-data'

interface FileEditorProps {
  file: FileDocument
  onSave: (data: FileEditorFormData) => Promise<void>
  onCancel?: () => void
  className?: string
}

export interface FileEditorFormData {
  name: string
  description?: string
  tags: FileTag[]
  linkedEntities: LinkedEntity[]
}

// Mock data for dropdowns - in real app these would come from API
const mockCases = [
  { id: 'case-1', name: 'قضية بيع عقار رقم 12345' },
  { id: 'case-2', name: 'قضية عمالية رقم 67890' },
  { id: 'case-3', name: 'قضية حادث مرور رقم 54321' },
  { id: 'case-4', name: 'قضية عيوب إنشائية رقم 98765' },
  { id: 'case-5', name: 'قضية تعويضات رقم 11111' },
]

const mockTrials = [
  { id: 'trial-1', name: 'جلسة 15 مارس 2024' },
  { id: 'trial-2', name: 'جلسة الحكم النهائي' },
  { id: 'trial-3', name: 'جلسة الخبرة الفنية' },
]

const mockClients = [
  { id: 'client-1', name: 'محمد بن عبدالله السعيد' },
  { id: 'client-2', name: 'شركة النور للتجارة' },
  { id: 'client-3', name: 'سارة القحطاني' },
]

const mockOpponents = [
  { id: 'opponent-1', name: 'شركة التأمين الوطنية' },
  { id: 'opponent-2', name: 'عبدالرحمن المالكي' },
]

const entityIconMap = {
  case: Briefcase,
  trial: Gavel,
  client: User,
  opponent: Users,
}

export function FileEditor({ file, onSave, onCancel, className }: FileEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<FileTag[]>(file.tags)
  const [linkedEntities, setLinkedEntities] = useState<LinkedEntity[]>(file.linkedEntities)
  const [showAddEntity, setShowAddEntity] = useState(false)
  const [entityType, setEntityType] = useState<LinkableEntityType>('case')
  const [entityId, setEntityId] = useState<string>('')

  const form = useForm<FileEditorFormData>({
    defaultValues: {
      name: file.name,
      description: file.description || '',
      tags: file.tags,
      linkedEntities: file.linkedEntities,
    },
  })

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await onSave({
        ...data,
        tags: selectedTags,
        linkedEntities,
      })
      toast.success('تم حفظ التغييرات بنجاح')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('حدث خطأ أثناء حفظ التغييرات')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTag = (tagId: string) => {
    const tag = mockTags.find((t) => t.id === tagId)
    if (tag && !selectedTags.find((t) => t.id === tagId)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId))
  }

  const handleAddEntity = () => {
    if (!entityId) return

    let entityName = ''
    let options: any[] = []

    switch (entityType) {
      case 'case':
        options = mockCases
        break
      case 'trial':
        options = mockTrials
        break
      case 'client':
        options = mockClients
        break
      case 'opponent':
        options = mockOpponents
        break
    }

    const entity = options.find((e) => e.id === entityId)
    if (entity && !linkedEntities.find((e) => e.id === entityId)) {
      setLinkedEntities([
        ...linkedEntities,
        {
          id: entity.id,
          type: entityType,
          name: entity.name,
        },
      ])
      setEntityId('')
      setShowAddEntity(false)
    }
  }

  const handleRemoveEntity = (entityId: string) => {
    setLinkedEntities(linkedEntities.filter((e) => e.id !== entityId))
  }

  const getEntityOptions = (type: LinkableEntityType) => {
    switch (type) {
      case 'case':
        return mockCases
      case 'trial':
        return mockTrials
      case 'client':
        return mockClients
      case 'opponent':
        return mockOpponents
      default:
        return []
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className={`space-y-6 ${className || ''}`}>
      {/* Basic Info */}
      <div className="space-y-4">
        <Controller
          control={form.control}
          name="name"
          rules={{ required: 'اسم الملف مطلوب' }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>اسم الملف *</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="أدخل اسم الملف"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>الوصف</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                placeholder="أضف وصفاً للملف"
                rows={3}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Separator />

      {/* Tags */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          <h3 className="text-sm font-semibold">الوسوم</h3>
        </div>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="gap-1">
                {tag.name}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <SearchSelect
          value=""
          onValueChange={handleAddTag}
          options={mockTags
            .filter((tag) => !selectedTags.find((t) => t.id === tag.id))
            .map((tag) => ({
              id: tag.id,
              label: tag.name,
            }))}
          placeholder="إضافة وسم..."
          searchPlaceholder="ابحث عن وسم..."
          emptyMessage="لا توجد وسوم"
          clearable={false}
        />
      </div>

      <Separator />

      {/* Linked Entities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            <h3 className="text-sm font-semibold">ربط الملف</h3>
          </div>
          {!showAddEntity && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddEntity(true)}
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة ربط
            </Button>
          )}
        </div>

        {/* Add Entity Form */}
        {showAddEntity && (
          <Card className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel htmlFor="entity-type">نوع الربط</FieldLabel>
                <SearchSelect
                  value={entityType}
                  onValueChange={(value) => {
                    setEntityType(value as LinkableEntityType)
                    setEntityId('')
                  }}
                  options={[
                    { id: 'case', label: 'قضية' },
                    { id: 'trial', label: 'جلسة' },
                    { id: 'client', label: 'عميل' },
                    { id: 'opponent', label: 'خصم' },
                  ]}
                  placeholder="اختر النوع"
                  clearable={false}
                />
              </div>

              <div>
                <FieldLabel htmlFor="entity-id">
                  {entityType === 'case' && 'القضية'}
                  {entityType === 'trial' && 'الجلسة'}
                  {entityType === 'client' && 'العميل'}
                  {entityType === 'opponent' && 'الخصم'}
                </FieldLabel>
                <SearchSelect
                  value={entityId}
                  onValueChange={setEntityId}
                  options={getEntityOptions(entityType).map((e) => ({
                    id: e.id,
                    label: e.name,
                  }))}
                  placeholder="اختر..."
                  searchPlaceholder="ابحث..."
                  emptyMessage="لا توجد نتائج"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAddEntity}
                disabled={!entityId}
              >
                إضافة
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowAddEntity(false)
                  setEntityId('')
                }}
              >
                إلغاء
              </Button>
            </div>
          </Card>
        )}

        {/* Linked Entities List */}
        {linkedEntities.length > 0 && (
          <div className="space-y-2">
            {linkedEntities.map((entity) => {
              const EntityIcon = entityIconMap[entity.type]
              return (
                <Card key={entity.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <EntityIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        {entity.type === 'case' && 'قضية'}
                        {entity.type === 'trial' && 'جلسة'}
                        {entity.type === 'client' && 'عميل'}
                        {entity.type === 'opponent' && 'خصم'}
                      </p>
                      <p className="text-sm font-medium truncate">{entity.name}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0"
                      onClick={() => handleRemoveEntity(entity.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {linkedEntities.length === 0 && !showAddEntity && (
          <p className="text-sm text-muted-foreground text-center py-4">
            لم يتم ربط هذا الملف بأي قضية أو جلسة أو عميل بعد
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6">
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? (
            <>
              <Loader2 className="ml-1 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="ml-1 h-4 w-4" />
              حفظ التغييرات
            </>
          )}
        </Button>

        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            إلغاء
          </Button>
        )}
      </div>
    </form>
  )
}
