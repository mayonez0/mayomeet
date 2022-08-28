/* eslint-disable react/jsx-props-no-spreading */
import React, {
  MouseEvent, ReactElement, useCallback, useEffect, useState,
} from 'react';
import { PlusCircle } from 'react-feather';
import ReactImageUploading, { ImageListType } from 'react-images-uploading';
import { useEffectOnce } from 'react-use';

import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import useFetchUserProfile from '@/hooks/api/auth/useFetchUserProfile';
import useRemoveGroupThumbnail from '@/hooks/api/storage/useRemoveGroupThumbnail';
import useUploadGroupThumbnail from '@/hooks/api/storage/useUploadGroupThumbnail';
import { writeFieldsState } from '@/recoil/group/atom';
import { body2Font, subtitle1Font } from '@/styles/fontStyles';
import { isEmpty } from '@/utils/utils';

import CloseSvg from '../../assets/icons/close.svg';
import HelperMessage from '../common/HelperMessage';
import Label from '../common/Label';

function ThumbnailUpload(): ReactElement {
  const theme = useTheme();
  const { mutate: onUploadThumbnail } = useUploadGroupThumbnail();
  const { mutate: onRemoveThumbnail } = useRemoveGroupThumbnail();
  const { data: user } = useFetchUserProfile();
  const { thumbnail } = useRecoilValue(writeFieldsState);
  const [images, setImages] = useState<ImageListType>([]);
  const [isError, setIsError] = useState<boolean>();

  const handleChange = (imageList: ImageListType) => setImages(imageList);

  const handleRemoveThumbnail = useCallback((
    e: MouseEvent<SVGElement>,
    onImageRemove: () =>void,
  ) => {
    e.stopPropagation();

    if (thumbnail) {
      onRemoveThumbnail(thumbnail);
    }

    onImageRemove();
  }, [thumbnail, onRemoveThumbnail]);

  useEffect(() => {
    if (!isEmpty(images) && images[0].file) {
      onUploadThumbnail({ userUid: user?.uid as string, thumbnail: images[0].file });
      setIsError(false);
    }
  }, [user, images]);

  useEffectOnce(() => {
    if (thumbnail) {
      setImages([{ dataURL: thumbnail }]);
    }
  });

  return (
    <ThumbnailFromWrapper>
      <Label
        htmlFor="thumbnail"
        labelText="썸네일"
        isError={isError}
      />
      <ReactImageUploading
        acceptType={['jpg', 'gif', 'png', 'jpeg']}
        value={images}
        onChange={handleChange}
        maxFileSize={10000000}
        onError={(error) => setIsError(error?.maxFileSize)}
        inputProps={{ alt: 'upload-thumbnail-input' }}
      >
        {({
          imageList,
          onImageUpload,
          onImageRemove,
          dragProps,
        }) => (
          <ThumbnailUploadBox
            onClick={onImageUpload}
            isError={isError}
            {...dragProps}
          >
            {isEmpty(imageList) ? (
              <EmptyBox>
                <PlusCircle
                  fill={theme.accent6}
                  color={theme.background}
                  width={40}
                  height={40}
                />
                <div>
                  썸네일 등록하기
                </div>
                <div>
                  JPG, JPEG, PNG, GIF
                </div>
              </EmptyBox>
            ) : (
              <>
                {imageList.map((image, index) => (
                  <ThumbnailImageWrapper key={image.dataURL}>
                    <CloseIcon
                      onClick={(
                        e: MouseEvent<SVGElement>,
                      ) => handleRemoveThumbnail(e, () => onImageRemove(index))}
                      data-testid="close-icon"
                    />
                    <ThumbnailImage src={image.dataURL} alt="thumbnail" />
                  </ThumbnailImageWrapper>
                ))}
              </>
            )}
          </ThumbnailUploadBox>
        )}
      </ReactImageUploading>
      <HelperMessage isError={isError} message={isError ? '10MB 이하의 이미지만 등록할 수 있어요.' : ''} />
    </ThumbnailFromWrapper>
  );
}

export default ThumbnailUpload;

const ThumbnailFromWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const EmptyBox = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0px;
  top: 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  & > div:first-of-type {
    ${body2Font(true)}
    color: ${({ theme }) => theme.accent6};
  }

  & > div:last-of-type {
    ${subtitle1Font()}
    color: ${({ theme }) => theme.accent4};
  }
`;

const ThumbnailUploadBox = styled.div<{ isError?: boolean; }>`
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100%;
  padding-top: 144px;
  border: 1px solid ${({ isError, theme }) => (isError ? theme.warning : theme.accent2)};
  box-sizing: border-box;
  border-radius: 8px;
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
`;

const ThumbnailImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0px;
  top: 0px;
`;

const CloseIcon = styled(CloseSvg)`
  cursor: pointer;
  position: absolute;
  top: 12px;
  right: 12px;
`;
