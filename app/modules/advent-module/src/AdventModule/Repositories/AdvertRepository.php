<?php
/**
 * This file is part of nivea-2017-11-advent_kalendar.
 * Copyright (c) 2017
 *
 * @file    AdvertRepository.php
 * @author  Pavel Paulík <pavel.paulik@support.etnetera.cz>
 */

namespace AdventModule\Repositories;

use AdventModule\InvalidArgumentException;
use AdventModule\Repositories\AdvertType\Product;
use Nette\Caching\Cache;
use Nette\Caching\IStorage;
use Nette;

class AdvertRepository
{

    use Nette\SmartObject;

    /** @var Cache */
    private $cache;

    /** @var array known urls */
    private $urls = [];


    /**
     * AdvertRepository constructor.
     *
     * @param IStorage $storage
     */
    public function __construct(IStorage $storage)
    {
        $this->cache = new Cache($storage, 'advert');
        $this->urls = [
            'demo1Product' => $this->getDemoUrl1(),
            'demo2Product' => $this->getDemoUrl2(),
        ];
    }


    /**
     * @return Product|NULL
     */
    public function getDemo1Product()
    {
        if ($result = $this->getResponse("demo1Product")) {

            $products = [];
            foreach ($result->products as $product) {
                $products[] = new Product($product);
            }

            return reset($products);
        }

        return $result;
    }

    /**
     * @return Product|NULL
     */
    public function getDemo2Product()
    {
        if ($result = $this->getResponse("demo2Product")) {

            $products = [];
            foreach ($result->products as $product) {
                $products[] = new Product($product);
            }

            return reset($products);
        }

        return $result;
    }




    /**
     * @param string $type
     * @example https://plrss-data.where-to-buy.co/feeds/plrss/v1/3260V_DNI?type=json&authorizationToken=Z58QH8nvuxDQlHRDCC7M4bXY7kkCAn5UE5Qwy9g6UpLXLHODqvQoTTNRXCYs4CXj8UhYuivs5V9Oo3l3gQGOlnuWQfBbiIyixZA1JSDWYnA=&track=false
     * @return string
     */
    protected function getDemoUrl1($type = "JSON")
    {
        if (!in_array($type, ['XML', 'JSON', 'JSONP'])) {
            throw new InvalidArgumentException("not supported type $type");
        }

        $query = http_build_query([
            'type' => $type,
            'authorizationToken' =>  "Z58QH8nvuxDQlHRDCC7M4bXY7kkCAn5UE5Qwy9g6UpLXLHODqvQoTTNRXCYs4CXj8UhYuivs5V9Oo3l3gQGOlnuWQfBbiIyixZA1JSDWYnA=",
        ]);

        return "https://plrss-data.where-to-buy.co/feeds/plrss/v1/3260V_DNI?" . urldecode($query);
    }

    /**
     * @param string $type
     * @example https://plrss-data.where-to-buy.co/feeds/plrss/v1/5410076462223?type=XML&tag=cademo-pinterest&authorizationToken=Z58QH8nvuxDQlHRDCC7M4Y9yg4mVHUQZ0AeAFEkcfrqe4NgVFOywS6WHKWbcjyMru3n5h7eqUhbAE9kg1Gmj5Rrg0RSP/y7Mi7+4J7rX/d0=
     * @example https://plrss-data.where-to-buy.co/feeds/plrss/v1/5410076462223?type=XML&tag=cademo-pinterest&authorizationToken=Z58QH8nvuxDQlHRDCC7M4dacrpaY8arVxpV1Bg+Fy7kcZeUbM1KtZqF1M5PHC3DvHuzDpVK8wdkQr6OXj3a9DITm4irLn5Q9t7vY6ta5bkk=
     *
     * @return string
     */
    protected function getDemoUrl2($type = "JSON")
    {
        if (!in_array($type, ['XML', 'JSON', 'JSONP'])) {
            throw new InvalidArgumentException("not supported type $type");
        }

        $query = http_build_query([
            'type' => $type,
            'tag' => "cademo-pinterest",
            'authorizationToken' =>  "Z58QH8nvuxDQlHRDCC7M4Y9yg4mVHUQZ0AeAFEkcfrqe4NgVFOywS6WHKWbcjyMru3n5h7eqUhbAE9kg1Gmj5Rrg0RSP/y7Mi7+4J7rX/d0=",
        ]);

        return "https://plrss-data.where-to-buy.co/feeds/plrss/v1/5410076462223?" . urldecode($query);
    }





    private function getResponse($fromUrl)
    {
        $url     = isset($this->urls[$fromUrl]) ? $this->urls[$fromUrl] : $fromUrl;
        $hashUrl = md5($url);

        if (!$response = $this->cache->load($hashUrl)) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_TIMEOUT, 1);
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            if(FALSE === ($data = curl_exec($ch))) {
    //            error_log(curl_error($ch));
            } else {
    //            return $retval;
            }

            $response = json_decode($data);
            $this->cache->save($hashUrl, $response, [
//                Cache::EXPIRE => '20 minutes',
                Cache::EXPIRE => '1 day',
            ]);

            curl_close($ch);
        }

//        dump($response);
//        die();
        return $response;
    }


}