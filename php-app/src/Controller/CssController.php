<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class CssController extends AbstractController
{
    protected const backgrounds = [
        0 => '#efefef',
        1 => '#888',
    ];

    /**
     * @Route("/css/{fileName}")
     */
    public function index(string $fileName, Request $request): Response
    {
        $number = $request->query->get('v', IndexController::VERSION_START);

        $backgroundIndex = $number % 2;

        $response = $this->render($fileName . '.twig', [
            'background' => self::backgrounds[$backgroundIndex],
        ]);

        $response->headers->set('Content-Type', 'text/css');

        return $response;
    }
}
