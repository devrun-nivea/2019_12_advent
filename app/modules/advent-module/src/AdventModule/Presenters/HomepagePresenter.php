<?php

namespace AdventModule\Presenters;


use Devrun\CmsModule\Repositories\ImageRepository;
use Devrun\PhantomModule\Entities\ImageEntity;

/**
 * Class HomepagePresenter
 * @package AdventModule\Presenters
 */
class HomepagePresenter extends BaseAppPresenter
{

    /** @var ImageRepository @inject */
    public $imageRepository;


    public function actionDefault()
    {
        $route = $this->routeRepository->findOneBy(['page.name' => 'advent:day:default']);

        /** @var ImageEntity[] $images */
        $images = $this->imageRepository->createQueryBuilder('e')
                                        ->addSelect('t')
                                        ->join('e.translations', 't')
                                        ->where('e.route = :route')->setParameter('route', $route)
                                        ->getQuery()
                                        ->getResult();

        $imgs = [];
        foreach ($images as $image) {
            $imgs[] = $this->imageStorage->getImageStorage()->fromIdentifier([$image->getIdentifier(), '200x200', 'shrink_only']);
        }

        $this->cacheImgs = $imgs;
    }


}
