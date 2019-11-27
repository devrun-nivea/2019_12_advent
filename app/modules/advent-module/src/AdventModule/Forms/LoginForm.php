<?php
/**
 * This file is part of nivea-2019-klub-rewards.
 * Copyright (c) 2019
 *
 * @file    LoginForm.php
 * @author  Pavel Paulík <pavel.paulik@support.etnetera.cz>
 */

namespace AdventModule\Forms;

use Nette\Forms\Form;

interface ILoginFormFactory
{
    /** @return LoginForm */
    function create();
}

/**
 * Class LoginForm
 *
 * @package RewardModule\Forms
 * @method onLoggedIn(\Nette\Security\User $user, $identity)
 */
class LoginForm extends BaseForm
{

    public function create()
    {

        $this->addText('username', 'username')
            ->setAttribute('placeholder', "username_placeholder")
            ->addRule(Form::FILLED, "username_required")
            ->addRule(Form::MIN_LENGTH, 'username_min', 3)
            ->addRule(Form::MAX_LENGTH, 'username_max', 32);

        $this->addPassword('password', 'password')
            ->setAttribute('placeholder', "password_placeholder")
            ->addRule(Form::FILLED, 'password_required');

        $this->addCheckbox('remember', 'remember')->getControl()->class[] = 'icheck';

        $this->addSubmit('send', 'send')->getControlPrototype()->class = 'btn btn-primary btn-md';
//        $this->onSuccess[] = array($this, 'success');

        $this->getElementPrototype()->class = 'margin-bottom-0';

        return $this;


    }

}