<?php
/**
 * This file is part of the nivea-2017-11-advent_kalendar
 * Copyright (c) 2017
 *
 * @file    Retailers.php
 * @author  Pavel Paulík <pavel.paulik@support.etnetera.cz>
 */

namespace AdventModule\Repositories\AdvertType;

use Nette\SmartObject;

class Retailer
{

    use SmartObject;

    /** @var string */
    protected $name;

    /** @var string */
    protected $display_name;

    /** @var string */
    protected $homepage_url;

    /** @var string */
    protected $logo_url;

    /** @var string */
    protected $description;

    /** @var string */
    protected $deeplink_url;

    /** @var bool */
    protected $instock;

    /** @var array */
    protected $product_images = [];

    /**
     * Retailer constructor.
     */
    public function __construct($retailer)
    {
        $properties = $this->getReflection()->getProperties(\ReflectionProperty::IS_PROTECTED);
        foreach ($properties as $property) {
            $name = $property->getName();
            if (isset($retailer->$name)) {
                $this->$name = $retailer->$name;
            }
        }
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return string
     */
    public function getDisplayName()
    {
        return $this->display_name;
    }

    /**
     * @return string
     */
    public function getHomepageUrl()
    {
        return $this->homepage_url;
    }

    /**
     * @return string
     */
    public function getLogoUrl()
    {
        return $this->logo_url;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @return string
     */
    public function getDeeplinkUrl()
    {
        return $this->deeplink_url;
    }

    /**
     * @return boolean
     */
    public function isInstock()
    {
        return (bool) $this->instock;
    }





}