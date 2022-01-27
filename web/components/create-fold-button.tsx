import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { parseWordsAsTags } from '../../common/util/parse'
import { createFold } from '../lib/firebase/api-call'
import { foldPath } from '../lib/firebase/folds'
import { toCamelCase } from '../lib/util/format'
import { ConfirmationButton } from './confirmation-button'
import { Col } from './layout/col'
import { Spacer } from './layout/spacer'
import { TagsList } from './tags-list'
import { Title } from './title'

export function CreateFoldButton() {
  const [name, setName] = useState('')
  const [about, setAbout] = useState('')
  const [otherTags, setOtherTags] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  const tags = parseWordsAsTags(toCamelCase(name) + ' ' + otherTags)

  const updateName = (newName: string) => {
    setName(newName)
  }

  const onSubmit = async () => {
    setIsSubmitting(true)

    const result = await createFold({
      name,
      tags,
      about,
    }).then((r) => r.data || {})

    if (result.fold) {
      await router.push(foldPath(result.fold)).catch((e) => {
        console.log(e)
        setIsSubmitting(false)
      })
    } else {
      console.log(result.status, result.message)
      setIsSubmitting(false)
    }
  }

  return (
    <ConfirmationButton
      id="create-fold"
      openModelBtn={{
        label: 'Create a fold',
        className: clsx(
          isSubmitting ? 'loading btn-disabled' : 'btn-primary',
          'btn-sm'
        ),
      }}
      submitBtn={{
        label: 'Create',
        className: clsx(name ? 'btn-primary' : 'btn-disabled'),
      }}
      onSubmit={onSubmit}
    >
      <Title className="!mt-0" text="Create a fold" />

      <Col className="text-gray-500 gap-1">
        <div>
          Markets are included in a fold if they match one or more tags.
        </div>
      </Col>

      <Spacer h={4} />

      <div>
        <div className="form-control w-full">
          <label className="label">
            <span className="mb-1">Fold name</span>
          </label>

          <input
            placeholder="Your fold name"
            className="input input-bordered resize-none"
            disabled={isSubmitting}
            value={name}
            maxLength={140}
            onChange={(e) => updateName(e.target.value || '')}
          />
        </div>

        <Spacer h={4} />

        <div className="form-control w-full">
          <label className="label">
            <span className="mb-1">About</span>
          </label>

          <input
            placeholder="Short description (140 characters max, optional)"
            className="input input-bordered resize-none"
            disabled={isSubmitting}
            value={about}
            maxLength={140}
            onChange={(e) => setAbout(e.target.value || '')}
          />
        </div>

        <Spacer h={4} />

        <label className="label">
          <span className="mb-1">Primary tag</span>
        </label>
        <TagsList noLink tags={[`#${toCamelCase(name)}`]} />

        <Spacer h={4} />

        <div className="form-control w-full">
          <label className="label">
            <span className="mb-1">Additional tags</span>
          </label>

          <input
            placeholder="Politics, Economics, Rationality (Optional)"
            className="input input-bordered resize-none"
            disabled={isSubmitting}
            value={otherTags}
            onChange={(e) => setOtherTags(e.target.value || '')}
          />
        </div>

        <Spacer h={4} />

        <TagsList
          tags={parseWordsAsTags(otherTags).map((tag) => `#${tag}`)}
          noLink
        />
      </div>
    </ConfirmationButton>
  )
}