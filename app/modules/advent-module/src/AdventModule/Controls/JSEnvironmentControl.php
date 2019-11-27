<?php
/**
 * Created by PhpStorm.
 * User: pavel
 * Date: 28.2.17
 * Time: 9:27
 */

namespace AdventModule\Control;

use Flame\Application\UI\Control;
use Nette\Bridges\ApplicationLatte\Template;

interface IJSEnvironmentControl
{
    /** @return JSEnvironmentControl */
    function create();
}

class JSEnvironmentControl extends Control
{


    public function render()
    {
        /** @var Template $template */
        $template = $this->createTemplate();

        $template->render();
    }


}