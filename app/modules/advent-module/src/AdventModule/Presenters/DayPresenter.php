<?php
/**
 * This file is part of souteze.pixman.cz.
 * Copyright (c) 2019
 *
 * @file    DayPresenter.php
 * @author  Pavel Paulík <pavel.paulik@support.etnetera.cz>
 */

namespace AdventModule\Presenters;


use Nette\Utils\Validators;
use Tracy\Debugger;

class DayPresenter extends BaseAppPresenter
{

    const DEFAULT_DAY = 1;

    /** @var bool */
    private $randomCalendar = false;


    public function renderDefault()
    {
        $this->template->today = $this->getToday();
        $this->template->today2Digit = sprintf("%02d", $this->getToday());
        $this->template->days  = $this->getDays();

    }


    /**
     * @return int actual day
     */
    public function getToday($customDay = NULL)
    {
        static $day;

        if ($day === NULL) {
            if ($this->isDebug()) {
                if (!$customDay) $customDay = date("d");
                $_day = is_numeric($customDay) && Validators::isInRange($customDay, [1, 24]) ? intval($customDay) : self::DEFAULT_DAY;

            } else {
                $_day = date("d");
            }

            $day  = $_day > 24 ? self::DEFAULT_DAY : $_day;
        }

        return intval($day);
    }


    /**
     * get calendar days
     * @return array
     */
    private function getDays()
    {
        $rawDays = [
            24, 1, 11, 4, 16, 20, 12, 3, 6, 14, 5, 9, 22, 18, 13, 2, 10, 23, 19, 7, 17, 8, 15, 21
        ];

        if ($this->randomCalendar) shuffle($rawDays);

        $days = [];
        foreach ($rawDays as $rawDay) {
            $days[$rawDay] = sprintf("%02d", $rawDay);
        }

        return $days;
    }


}