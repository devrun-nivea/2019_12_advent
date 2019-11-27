<?php
/**
 * This file is part of nivea-2017-07-diagnostika.
 * Copyright (c) 2017
 *
 * @file    ThankYouPresenter.php
 * @author  Pavel Paulík <pavel.paulik@support.etnetera.cz>
 */

namespace AdventModule\Presenters;

use AdventModule\Repositories\AdvertRepository;
use AdventModule\Repositories\StorePackageRepository;

class ThankYouPresenter extends BaseAppPresenter
{

//    /** @var AdvertRepository @inject */
//    public $advertRepository;

//    /** @var StorePackageRepository @inject */
//    public $storePackageRepository;


    public function renderDefault()
    {

        $this->template->scroll         = true;
//        $this->template->product1       = $this->advertRepository->getDemo1Product();
//        $this->template->product2       = $this->advertRepository->getDemo2Product();
//        $this->template->teaserManIdx   = $this->storePackageRepository->getTeaserManIndex();
//        $this->template->teaserWomanIdx = $this->storePackageRepository->getTeaserWomanIndex();


//        $this->template->teaserMan     = $this->packageRepository->getTeasersMan(1);
//        $this->template->teaserWoman   = $this->packageRepository->getTeasersWoman(1);
//        $this->template->imgPackLocale = $this->storePackageRepository->getImgPackLocale();

//        $this->template->teaserMan   = $teasersMan[3];
//        $this->template->teaserWoman = $teasersWoman[3];


//        dump($this->template->teaserMan);
//        dump($this->template->teaserWoman);
//        die();
        $this->template->registrationSend = false;

        $section = $this->getMySession();

        if (isset($section->registrationSend)) {
            unset($section->registrationSend);
            $this->template->registrationSend = true;
        }

    }


}