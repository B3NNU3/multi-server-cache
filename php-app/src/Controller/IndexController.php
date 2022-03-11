<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class IndexController extends AbstractController
{
    public const VERSION_START = 1646807089201;
    public const VERSION_END = 1646807089240;

    /**
     * @Route("/")
     */
    public function index(): Response
    {
        #return new Response('meh');

        $number = random_int(self::VERSION_START, self::VERSION_END);

        return $this->render('base.html.twig', [
            'number' => $number,
        ]);

    }
}
