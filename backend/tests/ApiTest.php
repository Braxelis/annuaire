<?php
use PHPUnit\Framework\TestCase;

class ApiTest extends TestCase
{
    private $baseUrl = 'http://localhost/api';

    private function curlRequest(string $endpoint, string $method = 'GET', array $data = []): array
    {
        $ch = curl_init();
        $url = $this->baseUrl . $endpoint;
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        if ($method === 'POST' || $method === 'PUT') {
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return ['code' => $httpCode, 'body' => $response];
    }

    public function testLoginSuccess()
    {
        $data = ['matricule' => 'EMP010', 'motdepasse' => 'testpassword'];
        $response = $this->curlRequest('/login', 'POST', $data);
        $this->assertEquals(200, $response['code']);
        $body = json_decode($response['body'], true);
        $this->assertArrayHasKey('token', $body);
    }

    public function testLoginFailure()
    {
        $data = ['matricule' => 'EMP010', 'motdepasse' => 'wrongpassword'];
        $response = $this->curlRequest('/login', 'POST', $data);
        $this->assertEquals(401, $response['code']);
    }

    public function testGetProfileUnauthorized()
    {
        $response = $this->curlRequest('/me');
        $this->assertEquals(401, $response['code']);
    }

    public function testSearchPersonnel()
    {
        $response = $this->curlRequest('/personnel/search?q=EMP');
        $this->assertEquals(200, $response['code']);
        $body = json_decode($response['body'], true);
        $this->assertIsArray($body);
    }

    // Add more tests for create, update, delete personnel if API supports it

}
