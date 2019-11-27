<?php
/**
 * This file is part of the nivea-2017-03-care
 * Copyright (c) 2017
 *
 * @file    CommonFilter.php
 * @author  Pavel Paulík <pavel.paulik@support.etnetera.cz>
 */

namespace AdventModule\Filters;

use Nette\Http\IRequest;
use Nette\Http\Session;

class CommonFilter
{

    const SESSION_SECTION = 'questions';


    /** @var IRequest */
    private $httpRequest;

    /** @var string proxy url */
    private $proxyBaseUrl;

    /** @var Session */
    private $session;


    /**
     * CommonFilter constructor.
     *
     * @param IRequest $httpRequest
     */
    public function __construct(IRequest $httpRequest, Session $session)
    {
        $this->httpRequest = $httpRequest;
        $this->session = $session;
    }


    public static function hostLink($link)
    {
        $extract = explode('/', $link);
        $adr     = end($extract);
        $baseUrl = (self::getProxyUrl());

        return "$baseUrl{$adr}";
    }


    public static function getProxyUrl()
    {
        return isset($_SERVER["HTTP_X_PF_BASEURL"]) ? $_SERVER["HTTP_X_PF_BASEURL"] . "" : "";
    }


    public function proxyLink($link)
    {
        if ($pfUrl = self::getProxyUrl()) {
            $baseUrl     = $this->httpRequest->getUrl()->basePath;
            $replaceLink = str_replace($baseUrl, '', $link);
            return "$pfUrl/{$replaceLink}";

        } elseif ($pfUrl = $this->proxyBaseUrl) {
            $baseUrl     = $this->httpRequest->getUrl()->basePath;
            $replaceLink = str_replace($baseUrl, '', $link);
            return "$pfUrl/{$replaceLink}";
        }

        return $link;
    }


    /**
     * @param string $proxyBaseUrl
     *
     * @return $this
     */
    public function setProxyBaseUrl($proxyBaseUrl)
    {
        $this->proxyBaseUrl = $proxyBaseUrl;
        return $this;
    }

    /**
     * @param $number
     *
     * @return string two digits number [08]
     */
    public static function numberTwoDigits($number)
    {
        return is_numeric($number)
            ? sprintf("%02d", $number)
            : $number;
    }


}