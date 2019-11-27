<?php
/**
 * This file is part of the nivea-2017-11-advent_kalendar
 * Copyright (c) 2017
 *
 * @file    PackageRepository.php
 * @author  Pavel Paulík <pavel.paulik@support.etnetera.cz>
 */

namespace AdventModule\Repositories;

use Kdyby\Translation\ITranslator;
use Kdyby\Translation\Translator;
use Nette\SmartObject;

class StorePackageRepository
{

    use SmartObject;


    /** @var Translator */
    private $translator;

    private $locale;

    /** @var array  */
    private $teasersMan = [];

    /** @var array  */
    private $teasersWoman = [];


    /**
     * PackageRepository constructor.
     *
     * @param ITranslator|Translator $translator
     */
    public function __construct(ITranslator $translator)
    {
        $this->translator = $translator;
        $this->locale = $translator->getLocale();
        $this->setTeasersMan();
        $this->setTeasersWoman();
    }

    public function getTeaserManIndex($index = null) {
        if (null === $index) {
            $index = rand(0, $this->getProductsByLocale()) + 1;
        }

        return $index;
    }

    public function getTeaserWomanIndex($index = null) {
        if (null === $index) {
            $index = rand(0, $this->getProductsByLocale()) + 1;
        }

        return $index;
    }

    public function getTeasersMan($index = NULL)
    {
        if (null === $index) {
            $index = rand(0, $this->getProductsByLocale());
        }

        $result = $this->teasersMan[$index];
        $result['index'] = $index + 1;

        return $result;
    }

    public function getTeasersWoman($index = NULL)
    {
        if (null === $index) {
            $index = rand(0, $this->getProductsByLocale());
        }

        $result = $this->teasersWoman[$index];
        $result['index'] = $index + 1;

        return $result;
    }

    public function getImgPackLocale()
    {
       return $this->locale == 'hu' ? 'HU' : 'CZ';
    }

    private function getProductsByLocale()
    {
        return $this->locale == 'hu' ? 0 : 2;
    }

    /**
     */
    public function setTeasersMan()
    {
        $imgLocale = $this->getImgPackLocale();

        $teasersMan = [
            ['img' => "THX_{$imgLocale}man01.png",
             'eventKrasa' => 'Men Sensitive - Krasa.cz', 'eventNotino' => 'Men Sensitive - Notino',
             'linkKrasa'  => $this->translator->translate('site.thanks.teaser2.link1_krasa'),
             'linkNotino' => $this->translator->translate('site.thanks.teaser2.link1_notino'),],
            ['img'        => "THX_{$imgLocale}man02.png",
             'eventKrasa' => 'Men Protect & Care - Notino', 'eventNotino' => 'Men Protect & Care - Notino',
             'linkKrasa'  => $this->translator->translate('site.thanks.teaser2.link2_krasa'),
             'linkNotino' => $this->translator->translate('site.thanks.teaser2.link2_notino'),],
            ['img'        => "THX_{$imgLocale}man03.png",
             'eventKrasa' => 'Men Sesitive cooling - Krasa.cz', 'eventNotino' => 'Men Sesitive cooling - Notino',
             'linkKrasa'  => $this->translator->translate('site.thanks.teaser2.link3_krasa'),
             'linkNotino' => $this->translator->translate('site.thanks.teaser2.link3_notino'),],
//            ['img'        => "THX_{$imgLocale}man04.png",
//             'eventKrasa' => 'Men Tool box emergency - Krasa.cz', 'eventNotino' => 'Men Tool box emergency - Notino',
//             'linkKrasa'  => $this->translator->translate('site.thanks.teaser2.link4_krasa'),
//             'linkNotino' => $this->translator->translate('site.thanks.teaser2.link4_notino'),],
        ];

        $this->teasersMan = $teasersMan;
    }

    /**
     */
    public function setTeasersWoman()
    {
        $imgLocale = $this->locale == 'hu' ? 'HU' : 'CZ';

        $teasersWoman = [
            ['img'        => "THX_{$imgLocale}woman01.png",
             'eventKrasa' => 'Creme Care - Krasa.cz', 'eventNotino' => 'Creme Care - Notino',
             'linkKrasa'  => $this->translator->translate('site.thanks.teaser1.link1_krasa'),
             'linkNotino' => $this->translator->translate('site.thanks.teaser1.link1_notino'),],
            ['img'        => "THX_{$imgLocale}woman02.png",
             'eventKrasa' => 'Smooth Care - Krasa.cz', 'eventNotino' => 'Smooth Care - Notino',
             'linkKrasa'  => $this->translator->translate('site.thanks.teaser1.link2_krasa'),
             'linkNotino' => $this->translator->translate('site.thanks.teaser1.link2_notino'),],
            ['img'        => "THX_{$imgLocale}woman02.png",
             'eventKrasa' => 'Deo clear - Krasa.cz', 'eventNotino' => 'Deo clear - Notino',
             'linkKrasa'  => $this->translator->translate('site.thanks.teaser1.link3_krasa'),
             'linkNotino' => $this->translator->translate('site.thanks.teaser1.link3_notino'),],
//            ['img'        => "THX_{$imgLocale}woman04.png",
//             'eventKrasa' => 'NIVEA Visage - Krasa.cz', 'eventNotino' => 'NIVEA Visage - Notino',
//             'linkKrasa'  => $this->translator->translate('site.thanks.teaser1.link4_krasa'),
//             'linkNotino' => $this->translator->translate('site.thanks.teaser1.link4_notino')],
        ];

        $this->teasersWoman = $teasersWoman;
    }





}