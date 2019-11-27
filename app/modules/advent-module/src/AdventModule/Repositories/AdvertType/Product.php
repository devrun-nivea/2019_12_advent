<?php
/**
 * This file is part of the nivea-2017-11-advent_kalendar
 * Copyright (c) 2017
 *
 * @file    Product.php
 * @author  Pavel Paulík <pavel.paulik@support.etnetera.cz>
 */

namespace AdventModule\Repositories\AdvertType;

use Nette\SmartObject;

/**
 * Class Product
 * @package FrontModule\Repositories\AdvertType
 */
class Product
{

    use SmartObject;

    /** @var string */
    protected $description;

    /** @var string */
    protected $additional_information;

    private $productImage;

    /** @var Retailer[] */
    private $retailers = [];

    /**
     * Product constructor.
     */
    public function __construct($product)
    {
        $properties = $this->getReflection()->getProperties(\ReflectionProperty::IS_PROTECTED);
        foreach ($properties as $property) {
            $name = $property->getName();
            if (isset($product->$name)) {
                $this->$name = $product->$name;
            }
        }

        if (isset($product->retailers)) {
            foreach ($product->retailers as $retailer) {
                if (!$this->productImage) {
                    if (!empty($productImages = $retailer->product_images)) {
                        if (filter_var($productImage = $productImages[0], FILTER_VALIDATE_URL)) {
                            $this->productImage = $productImage;
                        }
                    }
                }

                $this->retailers[] = new Retailer($retailer);
            }
        }
    }


    /**
     * @return mixed
     */
    public function getDescription()
    {
        return $this->description;
    }


    /**
     * @return mixed
     */
    public function getAdditionalInformation()
    {
        return $this->additional_information;
    }

    /**
     * @return Retailer[]
     */
    public function getRetailers()
    {
        return $this->retailers;
    }

    /**
     * @return mixed
     */
    public function getProductImage()
    {
        return $this->productImage;
    }


}